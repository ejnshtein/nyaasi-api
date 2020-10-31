import deepmerge from 'deepmerge'
import {
  parseComments,
  parseProfile,
  parseSearch,
  parseTorrent
} from './Scraper'
import {
  AgentOptions,
  GetTorrentOptions,
  NyaaApiRequestResult,
  NyaaRequestOptions,
  SearchOptions
} from './types'
import { Agent } from './Agent'
import { Profile, SearchResult, ViewTorrent } from './types/nyaa'

const DefaultOptions: AgentOptions = {
  host: 'https://nyaa.si',
  apiHost: 'https://nyaa.si/api'
}

export class Nyaa {
  options: AgentOptions
  agent: Agent

  constructor(options?: AgentOptions) {
    this.options = Object.assign({}, DefaultOptions, options)
    this.agent = new Agent(this.options)
  }

  async getMe(): Promise<Profile> {
    const result = await this.agent.call('profile')

    return parseProfile(result)
  }

  async search(
    query: string,
    options: SearchOptions = { filter: 0, category: '0_0' },
    params: NyaaRequestOptions = {}
  ): Promise<SearchResult> {
    const search = {
      q: query,
      f: (typeof options.filter !== 'undefined' && options.filter) || 0,
      c: (typeof options.filter !== 'undefined' && options.category) || '0_0'
    }
    const result = await this.agent.call(
      '',
      deepmerge.all([
        {
          params: search
        },
        params
      ])
    )

    return parseSearch(result, this.options.host)
  }

  static async search(
    query: string,
    options: SearchOptions = { filter: 0, category: '0_0' },
    params: NyaaRequestOptions = {}
  ): Promise<SearchResult> {
    const search = {
      q: query,
      f: (typeof options.filter !== 'undefined' && options.filter) || 0,
      c: (typeof options.filter !== 'undefined' && options.category) || '0_0'
    }
    const result = await Agent.call(
      '',
      deepmerge.all([
        {
          params: search
        },
        params
      ])
    )

    return parseSearch(params.baseUrl || 'https://nyaa.si', result.data)
  }

  async getTorrent(
    id: number,
    options: GetTorrentOptions = { withComments: false }
  ): Promise<NyaaApiRequestResult<ViewTorrent>> {
    const result = await this.agent.callApi<ViewTorrent>(`info/${id}`)
    if (options.withComments) {
      const comments = await this.agent.call(`view/${id}`)

      result.data.comments = parseComments(comments)
    }
    return result
  }

  static async getTorrent(
    id: number,
    options: GetTorrentOptions = { withComments: false },
    params: NyaaRequestOptions = {}
  ): Promise<ViewTorrent> {
    const result = await Agent.callApi<ViewTorrent>(`info/${id}`, params)
    if (options.withComments) {
      const comments = await Agent.call(`view/${id}`, params)

      result.data.comments = parseComments(comments.data)
    }
    return result.data
  }

  async getTorrentAnonymous(
    id: number,
    options: GetTorrentOptions = { withComments: false },
    params = {}
  ): Promise<ViewTorrent> {
    return Nyaa.getTorrentAnonymous(id, options, params)
  }

  static async getTorrentAnonymous(
    id: number,
    options: GetTorrentOptions = { withComments: false },
    params: NyaaRequestOptions = {}
  ): Promise<ViewTorrent> {
    const result = await Agent.call(`view/${id}`, params)
    const parsed = parseTorrent(id, params.baseUrl, result.data)
    if (options.withComments) {
      parsed.comments = parseComments(result.data)
    }
    return parsed
  }
}

export default Nyaa
