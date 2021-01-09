import { RequestOptions } from 'smol-request'

export interface Session {
  sessionId?: string
  sessionExpiration?: Date | string
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

export interface SearchQuery {
  title: string
  filter?: number
  category?: number | string
  subcategory?: number
}

export interface SearchParams {
  q: string
  f?: number
  c?: string
}

export interface GetTorrentOptions {
  withComments?: boolean
}
