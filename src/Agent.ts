import request, { RequestOptions, RequestResult } from '@ejnshtein/smol-request'
import deepmerge from 'deepmerge'
import cheerio from 'cheerio'
import fs from 'fs'
import { getCSRFToken, parseProfile } from './Scraper'
import { ParsedUrlQueryInput, stringify } from 'querystring'
import {
  AgentOptions,
  Cookie,
  LoginPayload,
  NyaaApiRequestResult,
  NyaaRequestOptions
} from './types'

const { version: packageVersion } = JSON.parse(
  fs.readFileSync('./package.json', 'utf-8')
)

const parseCookies = (cookies: string[]): Cookie[] =>
  cookies.map((cookie) =>
    cookie.split('; ').reduce((cookie, property) => {
      switch (true) {
        case property.toLowerCase().includes('domain'): {
          return {
            ...cookie,
            domain: property.split('=').pop()
          }
        }
        case property.toLowerCase().includes('expires'): {
          return {
            ...cookie,
            expires: new Date(property.split('=').pop())
          }
        }
        case property.toLowerCase().includes('httponly'): {
          return {
            ...cookie,
            httponly: true
          }
        }
        case property.includes('='): {
          return property.split('=').map((el, i) => {
            if (i === 0) {
              return el.toLowerCase()
            }
            return el
          })
        }
      }
      return cookie
    }, {})
  )

const cookiesToString = (cookies: Cookie[]): string[] =>
  cookies.map((cookie) => {
    const [name] = Object.keys(cookie).filter(
      (key) => !['domain', 'httponly', 'expires', 'path'].includes(key)
    )
    return `${name}=${cookie[name]}`
  })

const cookieToString = (cookie: Cookie) =>
  Object.entries(cookie)
    .map(([name, value]) => {
      switch (name) {
        case 'expires': {
          return `Expires=${value.toGMTString()}`
        }
        case 'domain': {
          return `Domain=${value}`
        }
        case 'httponly': {
          return 'HttpOnly'
        }
        case 'path': {
          return `Path=${value}`
        }
        default: {
          return `${name}=${value}`
        }
      }
    })
    .join('; ')

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
    const tmpCookies = parseCookies(tmpHeaders['set-cookie'])
    const { headers, data } = await request(
      `${options.baseUrl || 'https://nyaa.si'}/login`,
      {
        method: 'POST',
        headers: {
          'User-Agent': `nyaa-api/${packageVersion}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Cookie: cookiesToString(tmpCookies).join('; ')
        }
      },
      stringify((payload as unknown) as ParsedUrlQueryInput)
    )

    const cookies = parseCookies(headers['set-cookie'])

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

  async call(url = '', options = {}): Promise<string> {
    const result = await Agent.call(
      url,
      deepmerge.all([
        {
          baseUrl: this.host,
          headers: {
            Cookie: this.cookies.join('; ')
          }
        },
        options
      ]) as NyaaRequestOptions
    )

    if (result.headers['set-cookie']) {
      this.setCookies(parseCookies(result.headers['set-cookie']))
    }
    return result.data
  }

  async callApi<T>(url = '', options = {}): Promise<NyaaApiRequestResult<T>> {
    const result = await Agent.callApi<T>(url, {
      baseUrl: this.apiHost,
      responseType: 'json',
      ...options
    })

    if (result.status === 'error') {
      throw new Error(result.message)
    }

    return result
  }

  static async call(
    url: string,
    options: NyaaRequestOptions = {}
  ): Promise<RequestResult> {
    const finalUrl = `${options.baseUrl || 'https://nyaa.si'}${
      !(url.startsWith('/') && options.baseUrl.endsWith('/')) && '/'
    }${url}`
    const finalOptions = deepmerge.all([
      {
        method: 'GET',
        headers: {
          'User-Agent': `nyaa-api/${packageVersion}`
        }
      },
      options
    ])

    const result = await request(finalUrl, finalOptions)

    if (result.data.errors) {
      throw new Error(result.data.errors[0])
    }

    return result
  }

  static async callApi<T>(
    url: string,
    options: NyaaRequestOptions = {}
  ): Promise<NyaaApiRequestResult<T>> {
    const result = await Agent.call(`api${!url.startsWith('/') && '/'}${url}`, {
      responseType: 'json',
      ...options
    })

    return (result as unknown) as NyaaApiRequestResult<T>
  }
}
