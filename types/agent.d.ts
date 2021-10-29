import { RequestOptions } from 'smol-request'
import { AllCategories, RootCategories } from './categories.d'

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
  /**
   * ```json
   * {
   *   "0_0": "All categories",
   *   "1_0": "Anime",
   *   "1_1": "Anime - AMV",
   *   "1_2": "Anime - English",
   *   "1_3": "Anime - Non-English",
   *   "1_4": "Anime - Raw",
   *   "2_0": "Audio",
   *   "2_1": "Audio - Lossless",
   *   "2_2": "Audio - Lossy",
   *   "3_0": "Literature",
   *   "3_1": "Literature - English",
   *   "3_2": "Literature - Non-English",
   *   "3_3": "Literature - Raw",
   *   "4_0": "Live Action",
   *   "4_1": "Live Action - English",
   *   "4_2": "Live Action - Idol/PV",
   *   "4_3": "Live Action - Non-English",
   *   "4_4": "Live Action - Raw",
   *   "5_0": "Pictures",
   *   "5_1": "Pictures - Graphics",
   *   "5_2": "Pictures - Photos",
   *   "6_0": "Software",
   *   "6_1": "Software - Apps",
   *   "6_2": "Software - Games"
   * }
   * ```
   */
  category?: keyof RootCategories
}

export interface SearchParams {
  q: string
  f?: number
  c?: string
}

export interface GetTorrentOptions {
  withComments?: boolean
}
