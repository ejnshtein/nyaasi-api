import {
  RequestOptions,
  RequestResult,
  request,
  ResponseType,
  ResponseTypeMap
} from 'smol-request'
import cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'
import { ParsedUrlQueryInput, stringify } from 'querystring'
import { getCSRFToken, parseProfile } from './Scraper'
import {
  AgentOptions,
  Cookie,
  LoginPayload,
  NyaaApiRequestResult,
  NyaaRequestOptions
} from '../types/agent'
import { cookiesToString, parseCookies } from './lib/cookie'
import { deepmerge } from './lib/deepmerge'

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
)

export class Agent {
  host: string
  apiHost: string
  _cookies: Cookie[]
  sessionId?: string

  constructor({
    host = 'https://nyaa.si',
    apiHost = 'https://nyaa.si/api'
  }: AgentOptions = {}) {
    this.host = host
    this.apiHost = apiHost
  }

  get cookies(): string[] {
    return cookiesToString(this._cookies)
  }

  setCookies(cookies: Cookie[]): void {
    this._cookies = cookies
      .reduce((cookies, cookie) => {
        const [name] = Object.entries(cookie).pop()
        if (cookies.some((cookie) => typeof cookie[name] === 'string')) {
          const i = cookies.findIndex((cookie) => cookie[name])
          cookies[i] = cookie
        } else {
          cookies.push(cookie)
        }

        return cookies
      }, this._cookies || [])
      .filter((cookie) => {
        if (!cookie.expires) {
          return true
        }
        return (
          cookie.expires.getTime() !== 0 ||
          cookie.expires.getTime() > Date.now()
        )
      })
  }

  getCookies(): string[] {
    return cookiesToString(this._cookies)
  }

  async login(
    username: string,
    password: string,
    options?: RequestOptions
  ): Promise<boolean> {
    const cookies = await Agent.login(username, password, {
      baseUrl: this.host,
      ...options
    })

    this.setCookies(cookies)

    return this.checkLogin()
  }

  static async login(
    username: string,
    password: string,
    options?: RequestOptions & { baseUrl: string }
  ): Promise<Cookie[]> {
    if (!username || !password) {
      throw new Error('Not enough login info.')
    }
    const payload: LoginPayload = {
      username: username,
      password: password
    }

    const { data: tmpData, headers: tmpHeaders } = await request(
      `${options.baseUrl || 'https://nyaa.si'}/login`
    )
    payload.csrf_token = getCSRFToken(tmpData)
    const tmpCookies = parseCookies(tmpHeaders['set-cookie'] as string[])
    const { headers, data } = await request(
      `${options.baseUrl || 'https://nyaa.si'}/login`,
      {
        method: 'POST',
        headers: {
          'User-Agent': `nyaa-api/${pkg.version}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookiesToString(tmpCookies).join('; ')
        }
      },
      stringify((payload as unknown) as ParsedUrlQueryInput)
    )

    const cookies = parseCookies(headers['set-cookie'] as string[])

    if (!cookies.some((cookie) => cookie.session)) {
      const errorText = cheerio.load(data)('div').text()

      if (errorText) {
        throw new Error(errorText)
      }
      throw new Error('Failed to retrieve session id.')
    }

    return cookies
  }

  async _onDeleteSession(): Promise<{ result: string }> {
    this.sessionId = null

    await this.call('/logout')
    return { result: 'logout' }
  }

  async loginWithSession(path: string): Promise<boolean> {
    const file = await fs.promises.readFile(path, 'utf8')

    const cookies = file.split('\n')

    this.setCookies(parseCookies(cookies))

    const isLogin = this.checkLogin()

    return isLogin
  }

  async checkLogin(): Promise<boolean> {
    const result = await this.call('profile')

    const isLogin = parseProfile(result)

    return Boolean(isLogin)
  }

  async saveSession(path: string): Promise<boolean> {
    return Agent.saveSession(path, this.cookies)
  }

  static async saveSession(path: string, cookies: string[]): Promise<boolean> {
    await fs.promises.writeFile(path, cookies.join('\n'), 'utf8')
    return true
  }

  async call<K, T extends ResponseType = 'text'>(
    url = '',
    options: NyaaRequestOptions<T> = {}
  ): Promise<NonNullable<ResponseTypeMap<K>[T]>> {
    const result = await Agent.call<K, T>(
      url,
      deepmerge(
        {
          baseUrl: this.host
        },
        options,
        {
          headers: {
            Cookie: this.cookies.join('; ')
          }
        }
      )
    )

    if (result.headers['set-cookie']) {
      this.setCookies(parseCookies(result.headers['set-cookie'] as string[]))
    }
    return result.data
  }

  async callApi<T>(
    url = '',
    options: NyaaRequestOptions<'json'> = {}
  ): Promise<T> {
    const result = await Agent.callApi<T>(url, {
      baseUrl: this.apiHost,
      responseType: 'json',
      ...options
    })

    return result
  }

  static async call<K, T extends ResponseType = 'text'>(
    url: string,
    options: NyaaRequestOptions<T> = {}
  ): Promise<RequestResult<NonNullable<ResponseTypeMap<K>[T]>>> {
    const finalUrl = `${options.baseUrl || 'https://nyaa.si'}${
      !(url.startsWith('/') && options.baseUrl.endsWith('/')) && '/'
    }${url}`

    const result = await request<K, T>(
      finalUrl,
      deepmerge(
        {
          method: 'GET',
          headers: {
            'User-Agent': `nyaa-api/${pkg.version}`
          }
        },
        options
      )
    )

    return result
  }

  static async callApi<T>(
    url: string,
    options: NyaaRequestOptions<'json'> = {}
  ): Promise<T> {
    const { data: response } = await Agent.call<
      NyaaApiRequestResult<T>,
      'json'
    >(
      url,
      deepmerge(
        {
          baseUrl: 'https://nyaa.si/api'
        },
        options,
        { responseType: 'json' }
      )
    )

    if (response.status === 'error') {
      throw new Error(response.message)
    }

    return response.data
  }
}
