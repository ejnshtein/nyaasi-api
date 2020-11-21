import { RequestOptions } from 'smol-request'

export interface Cookie {
  domain?: string
  expires?: Date
  httponly?: boolean
  path?: string
  session?: string
}

export interface LoginPayload {
  username: string
  password: string
  csrf_token?: string
}

export interface NyaaRequestOptions<T = 'text'> extends RequestOptions<T> {
  baseUrl?: string
}

export type NyaaApiRequestResult<T> =
  | {
      status: 'error'
      message: string
    }
  | {
      status: 'ok'
      data: T
    }

export interface AgentOptions {
  host?: string
  apiHost?: string
}

export interface SearchOptions {
  filter?: number
  category?: string
}

export interface GetTorrentOptions {
  withComments?: boolean
}
