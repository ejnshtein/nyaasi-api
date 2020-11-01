import { RequestOptions } from '@ejnshtein/smol-request'

export * from './nyaa'

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

export type NyaaRequestOptions = RequestOptions & { baseUrl?: string }

export interface NyaaApiRequestResult<T> {
  status: string
  message?: string
  data?: T
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
