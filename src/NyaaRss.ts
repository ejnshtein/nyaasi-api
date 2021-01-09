import RssParser from 'rss-parser'
import { decode } from 'html-entities'
import { RSSFile } from '../types/nyaa'

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

export class NyaaRss {
  static async get(): Promise<RSSFile[]> {
    const data = await parser.parseURL('https://nyaa.si/?page=rss')

    const rssFiles: RSSFile[] = data.items.map((el) => ({
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

    return rssFiles
  }
}
