import { parseComments, parseSearch, parseTorrent } from './Scraper'
import {
  AgentOptions,
  GetTorrentOptions,
  NyaaRequestOptions,
  SearchQuery
} from '../types/agent'
import { Agent } from './Agent'
import { SearchResult, ViewTorrent } from '../types/nyaa'
import { deepmerge } from './lib/deepmerge'
import { getParams } from './lib/get-params'

const DefaultOptions: AgentOptions = {
  host: 'https://nyaa.si',
  apiHost: 'https://nyaa.si/api'
}

export class Nyaa {
  options: AgentOptions
  agent: Agent

  constructor(options: AgentOptions = {}) {
    this.options = deepmerge(DefaultOptions, options)
    this.agent = new Agent(this.options)
  }

  async search(
    query: string | SearchQuery,
    options: NyaaRequestOptions<'text'> = {}
  ): Promise<SearchResult> {
    const searchParams = getParams(query)

    const result = await this.agent.call(
      '',
      deepmerge(options, {
        params: (searchParams as unknown) as Record<string, unknown>
      })
    )

    return parseSearch(result, this.options.host)
  }

  static async search(
    query: string | SearchQuery,
    options: NyaaRequestOptions<'text'> = {}
  ): Promise<SearchResult> {
    const searchParams = getParams(query)

    const result = await Agent.call(
      '',
      deepmerge(options, {
        params: (searchParams as unknown) as Record<string, unknown>
      })
    )

    return parseSearch(result.data, options.baseUrl || 'https://nyaa.si')
  }

  // async getTorrent(
  //   id: number,
  //   options: GetTorrentOptions = { withComments: false }
  // ): Promise<ViewTorrent> {
  //   const result = await this.agent.callApi<ViewTorrent>(`info/${id}`)
  //   if (options.withComments) {
  //     const comments = await this.agent.call(`view/${id}`)

  //     result.comments = parseComments(comments)
  //   }
  //   return result
  // }

  // static async getTorrent(
  //   id: number,
  //   options: GetTorrentOptions = { withComments: false },
  //   params: NyaaRequestOptions<'json'> = {}
  // ): Promise<ViewTorrent> {
  //   const result = await Agent.callApi<ViewTorrent>(`info/${id}`, params)
  //   if (options.withComments) {
  //     const comments = await Agent.call(`view/${id}`, params)

  //     result.comments = parseComments(comments.data as string)
  //   }
  //   return result
  // }

  async getTorrentAnonymous(
    id: number,
    options: GetTorrentOptions = { withComments: false },
    params = {}
  ): Promise<ViewTorrent> {
    return Nyaa.getTorrentAnonymous(id, options, params)
  }

  static async getTorrentAnonymous(
    id: number,
    args: GetTorrentOptions = { withComments: false },
    options: NyaaRequestOptions<'text'> = {}
  ): Promise<ViewTorrent> {
    const result = await Agent.call(`view/${id}`, options)
    const parsed = parseTorrent(id, result.data)
    if (args.withComments) {
      parsed.comments = parseComments(result.data)
    }
    return parsed
  }
}
