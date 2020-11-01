import cheerio from 'cheerio'
import bytes from 'bytes-iec'
import {
  Comment,
  Entry,
  Profile,
  SearchResult,
  ViewTorrent
} from '../types/nyaa'
import { URL } from 'url'

export const getCSRFToken = (html: string): string => {
  const selector = cheerio.load(html)

  return selector('#csrf_token').attr('value')
}

export const parseProfile = (html: string): Profile => {
  const selector = cheerio.load(html)

  if (selector('title').text().toLowerCase().includes('redirecting')) {
    return null
  } else {
    const profile = {
      id: Number.parseInt(
        selector(
          'body > div > div.row > div.col-sm-10 > dl > dd:nth-child(2)'
        ).text()
      ),
      username: selector('body > div > h2 > .text-default').text(),
      avatar: selector('body > div > div.row > div.col-sm-2 > img').attr('src'),
      class: selector(
        'body > div > div.row > div.col-sm-10 > dl > dd:nth-child(4)'
      ).text(),
      created_at: new Date(
        selector(
          'body > div > div.row > div.col-sm-10 > dl > dd:nth-child(6)'
        ).text()
      )
    }
    return profile
  }
}

export const parseComments = (html: string): Comment[] => {
  const select = cheerio.load(html)
  return select('#collapse-comments > div.panel')
    .map((i, el) => {
      const commentSelector = cheerio.load(el)
      return {
        id: Number.parseInt(
          commentSelector(
            '.panel-body > .comment > .comment-body > .comment-content'
          )
            .attr('id')
            .match(/torrent-comment([0-9]+)/i)[1]
        ),
        from: {
          username: commentSelector('.panel-body > .col-md-2 > p > a').text(),
          avatar: commentSelector('.panel-body > .col-md-2 > img').attr('src')
        },
        timestamp:
          Number.parseInt(
            commentSelector(
              '.panel-body > .comment > .comment-details > a > small'
            ).attr('data-timestamp')
          ) * 1000,
        publish_date: new Date(
          Number.parseInt(
            commentSelector(
              '.panel-body > .comment > .comment-details > a > small'
            ).attr('data-timestamp')
          ) * 1000
        ),
        text: commentSelector(
          '.panel-body > .comment > .comment-body > .comment-content'
        ).html()
      }
    })
    .get()
}

export const parseSearch = (
  html: string,
  host = 'https://nyaa.si'
): SearchResult => {
  const page = cheerio.load(html)
  const table = page(
    'body > div.container > div.table-responsive > table > tbody'
  )
  const files = table
    .children('tr')
    .map((i, el) => {
      const select = cheerio.load(el)
      return {
        id: Number.parseInt(
          select('td:nth-child(2) > a:last-of-type')
            .attr('href')
            .split('/')
            .pop()
        ),
        category: {
          label: select('td:nth-child(1) > a').attr('title'),
          code: new URL(
            select('td:nth-child(1) > a').attr('href'),
            host
          ).searchParams.get('c')
        },
        name: select('td:nth-child(2) > a:last-of-type').text().trim(),
        links: {
          page: select('td:nth-child(2) > a:last-of-type').attr('href'),
          file: select('td:nth-child(3) > a').attr('href'),
          magnet: select('td:nth-child(3) > a:last-of-type').attr('href')
        },
        file_size: select('td:nth-child(4)').text(),
        file_size_bytes: bytes.parse(select('td:nth-child(4)').text()),
        timestamp: Number.parseInt(
          select('td:nth-child(5)').attr('data-timestamp')
        ),
        stats: {
          downloaded: Number.parseInt(select('td:nth-child(8)').text()),
          seeders: Number.parseInt(select('td:nth-child(6)').text()),
          leechers: Number.parseInt(select('td:nth-child(7)').text())
        },
        entry: getEntry(el.attribs.class)
      }
    })
    .get()
  const current_page =
    Number.parseInt(
      page('body > div.container > div.center > nav > ul').html()
        ? new URL(
            page(
              'body > div.container > div.center > nav > ul > li.active > a'
            ).attr('href'),
            host
          ).searchParams.get('p')
        : page('body > div.container > div.center > ul > li.active').text()
    ) || 1
  const last_page =
    Number.parseInt(
      page('body > div.container > div.center > nav > ul').html()
        ? new URL(
            page(
              'body > div.container > div.center > nav > ul > li:last-of-type'
            )
              .prev()
              .children('a')
              .attr('href'),
            host
          ).searchParams.get('p')
        : new URL(
            page('body > div.container > div.center > ul > li.next')
              .prev()
              .children('a')
              .attr('href'),
            host
          ).searchParams.get('p')
    ) || 1
  return {
    current_page,
    last_page,
    files
  }
}

export const parseTorrent = (
  id: number,
  html: string,
  host = 'https://nyaa.si'
): ViewTorrent => {
  const select = cheerio.load(html)

  select('.servers-cost-money1').remove()

  const entryMatch = select('body > div.container > div:first-of-type').attr(
    'class'
  )

  return {
    id: id,
    name: select(
      'body > div.container > div.panel:first-of-type > div.panel-heading > h3'
    )
      .text()
      .trim(),
    file_size: select(
      'body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(2)'
    ).html(),
    file_size_bytes: bytes.parse(
      select(
        'body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(2)'
      ).html()
    ),
    category: select(
      'body > div.container > div.panel > div.panel-body > div:nth-child(1) > div:nth-child(2)'
    )
      .children('a')
      .map((i, el) => ({
        label: el.children[0].data,
        code: el.attribs.href.match(/c=(\S+)/i)[1]
      }))
      .get(),
    entry: getEntry(entryMatch.match(/panel-(\S+)$/i)[1]),
    links: {
      torrent:
        host +
        select(
          'body > div.container > div.panel > div:last-of-type > a:first-of-type'
        ).attr('href'),
      magnet: select(
        'body > div.container > div.panel > div:last-of-type > a:last-of-type'
      ).attr('href')
    },
    timestamp:
      Number.parseInt(
        select(
          'body > div.container > div.panel > div.panel-body > div:nth-child(1) > div:nth-child(4)'
        ).attr('data-timestamp')
      ) * 1000,
    submitter: select(
      'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a'
    ).html()
      ? {
          name: select(
            'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a'
          ).html(),
          link:
            host +
            select(
              'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a'
            ).attr('href')
        }
      : {
          name: 'Anonymous',
          link: null
        },
    description: select('#torrent-description').html(),
    info:
      select(
        'body > div.container > div.panel > div.panel-body > div:nth-child(3) > div:nth-child(2) a'
      ).attr('href') || 'No information',
    info_hash: select(
      'body > div.container > div.panel > div.panel-body > div:nth-child(5) > div.col-md-5 > kbd'
    ).html(),
    stats: {
      seeders: Number.parseInt(
        select(
          'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(4) > span'
        ).html()
      ),
      leechers: Number.parseInt(
        select(
          'body > div.container > div.panel > div.panel-body > div:nth-child(3) > div:nth-child(4) > span'
        ).html()
      ),
      downloaded: Number.parseInt(
        select(
          'body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(4)'
        ).html()
      )
    }
  }
}

export function getEntry(entry: string): Entry {
  switch (entry) {
    case 'danger':
      return '[Remake]'
    case 'success':
      return '[Trusted]'
    default:
      return null
  }
}
