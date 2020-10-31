import RssParser from 'rss-parser'

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
      'description',
      'guid'
    ]
  }
})

export class NyaaRss {
  static async get() {
    const data = await parser.parseURL('https://nyaa.si/?page=rss')
    data.items.forEach((el) => {
      el.id = Number.parseInt(el.guid.split('/').pop())
    })
    return data
  }
}
