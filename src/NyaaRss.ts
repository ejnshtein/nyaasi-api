import RssParser from 'rss-parser'
import { decode } from 'html-entities'

import { getParams } from './lib/get-params'
import { RSSFile } from '../types/nyaa'
import { Awaited } from '../types/awaited'
import { SearchQuery } from '../types/agent'
import { URL, URLSearchParams } from 'url'

const parser = new RssParser({
  customFields: {
    item: [
      'nyaa:seeders',
      'nyaa:leechers',
      'nyaa:downloads',
      'nyaa:infoHash',
      'nyaa:categoryId',
      'nyaa:category',
      'nyaa:size',
      'nyaa:trusted',
      'nyaa:remake',
      'nyaa:comments',
      'description',
      'guid',
      'title'
    ]
  }
})

const parseItems = (
  items: Awaited<ReturnType<typeof parser.parseURL>>['items']
): RSSFile[] =>
  items.map((el) => ({
    id: Number.parseInt(el.guid.split('/').pop()),
    title: decode(el.title),
    guid: el.guid,
    description: el.description,
    pubDate: new Date(el.pubDate),
    seeders: parseInt(el['nyaa:seeders']),
    leechers: parseInt(el['nyaa:leechers']),
    downloads: parseInt(el['nyaa:downloads']),
    infoHash: el['nyaa:infoHash'],
    categoryId: el['nyaa:categoryId'],
    category: el['nyaa:category'],
    size: el['nyaa:size'],
    comments: parseInt(el['nyaa:comments']),
    trusted: el['nyaa:trusted'],
    remake: el['nyaa:remake']
  }))

export interface NyaaRssOptions {
  host?: string
}
export class NyaaRss {
  constructor(private options: NyaaRssOptions) {}

  async getHome(): Promise<RSSFile[]> {
    return NyaaRss.getHome(this.options)
  }

  static async getHome({
    host = 'https://nyaa.si/'
  }: NyaaRssOptions = {}): Promise<RSSFile[]> {
    const data = await parser.parseURL(host)

    return parseItems(data.items)
  }

  async search(query: string | SearchQuery): Promise<RSSFile[]> {
    return NyaaRss.search(query, this.options)
  }

  static async search(
    query: string | SearchQuery,
    { host = 'https://nyaa.si/' }: NyaaRssOptions = {}
  ): Promise<RSSFile[]> {
    const searchParams = new URLSearchParams(
      getParams(query) as unknown as Record<string, string | readonly string[]>
    )

    searchParams.append('page', 'rss')

    const url = new URL(`${host}?${searchParams.toString()}`)

    const data = await parser.parseURL(url.toString())

    return parseItems(data.items)
  }
}
