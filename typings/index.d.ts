import * as nyaa from './nyaa.d'
import { RequestOptions, RequestResult } from '@ejnshtein/smol-request'

import { Stream } from 'stream'

export const Nyaa: NyaaConstructor

export const Agent: AgentConstructor

export interface NyaaOptions {
  host: string
  apiHost: string
}

export interface NyaaConstructor {
  new (options?: NyaaOptions): Nyaa
}

interface SearchOptions {
  filter: number | string
  category: string
}

interface GetTorrentOptions {
  withComments: boolean
}

export interface Nyaa {

  getMe (): Promise<nyaa.UserProfile>

  search (query: string, options?: SearchOptions, params?: RequestOptions): Promise<nyaa.SearchResult>

  getTorrent (id: number, options?: GetTorrentOptions, params?: RequestOptions): Promise<nyaa.ApiTorrent>

}

interface Cookie {
  path?: string
  expires?: Date
  httponly?: boolean
  domain?: string
  [x as string]: any
}

export interface AgentOptions {
  host: string
  apiHost: string
}

export interface AgentConstructor {
  new (options: AgentOptions): Agent
}

interface AgentMethodOptions extends RequestOptions {
  baseUrl: string
}

export interface Agent {

  cookies: string

  fullCookies: string

  login (username: string, password: string, options?: AgentMethodOptions): Promise<nyaa.UserProfile>

  logiWithSession (path: string): Promise<nyaa.UserProfile>

  checkLogin (): Promise<nyaa.UserProfile>

  saveSession (path: string): Promise<boolean>

  call (url: string, options?: RequestOptions): Promise<String | Buffer | Stream | Object | Array>

  callApi (url: string, options?: RequestOptions): Promise<Object | Array>

  
}
