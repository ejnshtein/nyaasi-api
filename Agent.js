import request from '@ejnshtein/smol-request'
import deepmerge from 'deepmerge'
import cheerio from 'cheerio'
import fs from 'fs'
import { getCSRFToken, parseProfile } from './Scraper.js'
import { stringify } from 'querystring'

const { promises: { writeFile, readFile } } = fs

const { version: packageVersion } = JSON.parse(fs.readFileSync('./package.json'))

const parseCookies = cookies => cookies.map(cookie => {
  const parsedCookie = cookie
    .split('; ')
    .map(property => {
      switch (true) {
        case property.toLowerCase().startsWith('domain'): {
          return ['domain', property.split('=').pop()]
        }
        case property.toLowerCase().startsWith('expires'): {
          return ['expires', new Date(property.split('=').pop())]
        }
        case property.includes('='): {
          return property.split('=').map((el, i) => {
            if (i === 0) {
              return el.toLowerCase()
            }
            return el
          })
        }
        default: {
          return [property.toLowerCase()]
        }
      }
    })
    .reduce((acc, val) => {
      if (val.length > 1) {
        const [name, value] = val
        acc[name] = value
      } else {
        acc[val[0]] = true
      }
      return acc
    }, {})
  return parsedCookie
})

const cookiesToString = cookies => cookies.map(cookie => {
  const [name] = Object.keys(cookie).filter(key => !['domain', 'httponly', 'expires', 'path'].includes(key))
  return `${name}=${cookie[name]}`
})

const cookieToString = cookie => Object.entries(cookie)
  .map(
    ([name, value]) => {
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
    }
  )
  .join('; ')

export class Agent {
  constructor ({
    host = 'https://nyaa.si',
    apiHost = 'https://nyaa.si/api'
  }) {
    this.host = host
    this.apiHost = apiHost
  }

  set cookies (cookies) {
    this._cookies = cookies.reduce(
      (cookies, cookie) => {
        const [name] = Object.entries(cookie).pop()
        if (cookies.some(cookie => typeof cookie[name] === 'string')) {
          const i = cookies.findIndex(cookie => cookie[name])
          cookies[i] = cookie
        } else {
          cookies.push(cookie)
        }

        return cookies
      },
      this._cookies || []
    )
      .filter(cookie => {
        if (!cookie.expires) {
          return true
        }
        return cookie.expires.getTime() !== 0 || cookies.expires.getTime() > Date.now()
      })
  }

  get cookies () {
    return cookiesToString(this._cookies)
  }

  get fullCookies () {
    return this._cookies.map(cookieToString)
  }

  async login (username, password, options = {}) {
    const cookies = await Agent.login(username, password, { baseUrl: this.host, ...options })
    this.cookies = cookies
    return this.checkLogin()
  }

  static async login (username, password, options = {}) {
    if (!username || !password) {
      throw new Error('Not enough login info.')
    }
    const payload = {
      username: username,
      password: password
    }

    const { data: tmpData, headers: tmpHeaders } = await request(`${options.baseUrl || 'https://nyaa.si'}/login`)
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
      stringify(payload)
    )

    const cookies = parseCookies(headers['set-cookie'])

    if (!cookies.some(cookie => cookie['session'])) {
      const errorText = cheerio.load(data)('div').text()

      if (errorText) {
        throw new Error(errorText)
      }
      throw new Error('Failed to retrieve session id.')
    }

    return cookies
  }

  async _onDeleteSession () {
    this.sessionId = null

    await this.call('/logout')
    return { result: 'logout' }
  }

  async loginWithSession (path) {
    const file = await readFile(path, 'utf8')

    const cookies = file.split('\n')

    this.cookies = parseCookies(cookies)

    const isLogined = this.checkLogin()

    return isLogined
  }

  async checkLogin () {
    const result = await this.call('profile')

    const isLogined = parseProfile(result)

    return isLogined
  }

  async saveSession (path) {
    return Agent.saveSession(path, this.fullCookies)
  }

  static async saveSession (path, cookies) {
    await writeFile(path, cookies.join('\n'), 'utf8')
    return true
  }

  async call (url = '', options = {}) {
    const result = await Agent.call(
      url,
      deepmerge.all(
        [
          {
            baseUrl: this.host,
            headers: {
              Cookie: this.cookies.join('; ')
            }
          },
          options
        ]
      )
    )

    if (result.headers['set-cookie']) {
      this.cookies = parseCookies(result.headers['set-cookie'])
    }
    return result.data
  }

  async callApi (url = '', options = {}) {
    const result = await this.call(
      url,
      {
        baseUrl: this.apiHost,
        responseType: 'json',
        ...options
      }
    )
    if (result.status === 'error') {
      throw new Error(result.message)
    }

    return result
  }

  static async call (url = '', options = {}) {
    const finalUrl = `${options.baseUrl || 'https://nyaa.si'}${!(url.startsWith('/') && options.baseUrl.endsWith('/')) && '/'}${url}`
    const finalOptions = deepmerge.all(
      [
        {
          method: 'GET',
          headers: {
            'User-Agent': `nyaa-api/${packageVersion}`
          }
        },
        options
      ]
    )

    const result = await request(
      finalUrl,
      finalOptions
    )

    if (result.data.errors) {
      throw new Error(result.data.errors[0])
    }

    return result
  }

  static async callApi (url = '', options = {}) {
    const result = await Agent.call(`api${!url.startsWith('/') && '/'}${url}`, {
      responseType: 'json',
      ...options
    })
    return result
  }
}
