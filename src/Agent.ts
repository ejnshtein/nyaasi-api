import {
  RequestResult,
  request,
  ResponseType,
  ResponseTypeMap
} from 'smol-request'
import fs from 'fs'
import path from 'path'
import {
  AgentOptions,
  NyaaApiRequestResult,
  NyaaRequestOptions
} from '../types/agent'
import { deepmerge } from './lib/deepmerge'

const pkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
)

export class Agent {
  public sessionId?: string
  public persistentId?: string
  public host: string
  public apiHost: string

  constructor({
    host = 'https://nyaa.si',
    apiHost = 'https://nyaa.si/api'
  }: AgentOptions = {}) {
    this.host = host
    this.apiHost = apiHost
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
        options
      )
    )

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
