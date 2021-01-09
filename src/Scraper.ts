import { URL } from 'url'

import cheerio from 'cheerio'
import ch from '../types/cheerio'
import { Element } from '../types/domhandler'
import bytes from 'bytes-iec'
import {
  Comment,
  Entry,
  SearchResult,
  ViewTorrent,
  SearchTorrent
} from '../types/nyaa'

// export const getCSRFToken = (html: string): string => {
//   const selector = cheerio.load(html)

//   return selector('#csrf_token').attr('value')
// }

// export const parseProfile = (html: string): Profile => {
//   const selector = cheerio.load(html)

//   if (selector('title').text().toLowerCase().includes('redirecting')) {
//     return null
//   } else {
//     const profile = {
//       id: Number.parseInt(
//         selector(
//           'body > div > div.row > div.col-sm-10 > dl > dd:nth-child(2)'
//         ).text()
//       ),
//       username: selector('body > div > h2 > .text-default').text(),
//       avatar: selector('body > div > div.row > div.col-sm-2 > img').attr('src'),
//       class: selector(
//         'body > div > div.row > div.col-sm-10 > dl > dd:nth-child(4)'
//       ).text(),
//       created_at: new Date(
//         selector(
//           'body > div > div.row > div.col-sm-10 > dl > dd:nth-child(6)'
//         ).text()
//       )
//     }
//     return profile
//   }
// }

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
  const content = ((cheerio as unknown) as typeof ch).load(html)

  const parseSearch = (i: number, el: Element): SearchTorrent => {
    const tagList = el.childNodes.filter((n) => n.type === 'tag')

    const file_size = tagList
      .find((tag, i) => tag.name === 'td' && i === 3)
      .children.find((tag) => tag.type === 'text')
      .data.trim()

    return {
      id: parseInt(
        tagList
          .find((tag, i) => tag.name === 'td' && i === 1)
          .children.find((tag) => tag.name === 'a')
          .attribs.href.split('/')
          .pop()
      ),
      category: {
        label: tagList
          .find((tag) => tag.name === 'td')
          .children.find((tag) => tag.name === 'a').attribs.title,
        code: new URL(
          host +
            tagList
              .find((tag) => tag.name === 'td')
              .children.find((tag) => tag.name === 'a').attribs.href
        ).searchParams.get('c')
      },
      name: tagList
        .find((tag, i) => tag.name === 'td' && i === 1)
        .children.find(
          (tag) =>
            tag.name === 'a' &&
            (!tag.attribs.class || !tag.attribs.class.includes('comments'))
        )
        .attribs.title.trim(),
      links: {
        page: tagList
          .find((tag, i) => tag.name === 'td' && i === 1)
          .children.find((tag) => tag.name === 'a').attribs.href,
        file: tagList
          .find((tag, i) => tag.name === 'td' && i === 2)
          .children.find((tag) => tag.name === 'a').attribs.href,
        magnet: tagList
          .find((tag, i) => tag.name === 'td' && i === 2)
          .children.find(
            (tag) =>
              tag.name === 'a' &&
              tag.attribs.href &&
              tag.attribs.href.startsWith('magnet')
          ).attribs.href
      },
      file_size,
      file_size_bytes: bytes.parse(file_size),
      stats: {
        downloaded: parseInt(
          tagList
            .find((tag, i) => tag.name === 'td' && i === 7)
            .children.find((tag) => tag.type === 'text')
            .data.trim()
        ),
        seeders: parseInt(
          tagList
            .find((tag, i) => tag.name === 'td' && i === 5)
            .children.find((tag) => tag.type === 'text')
            .data.trim()
        ),
        leechers: parseInt(
          tagList
            .find((tag, i) => tag.name === 'td' && i === 6)
            .children.find((tag) => tag.type === 'text')
            .data.trim()
        )
      },
      timestamp: parseInt(
        tagList.find((tag, i) => tag.name === 'td' && i === 4).attribs[
          'data-timestamp'
        ]
      ),
      entry: getEntry(el.attribs.class)
    }
  }

  const current_page =
    Number.parseInt(
      content('body > div.container > div.center > nav > ul').html()
        ? new URL(
            content(
              'body > div.container > div.center > nav > ul > li.active > a'
            ).attr('href'),
            host
          ).searchParams.get('p')
        : content('body > div.container > div.center > ul > li.active').text()
    ) || 1

  const last_page =
    Number.parseInt(
      content('body > div.container > div.center > nav > ul').html()
        ? new URL(
            content(
              'body > div.container > div.center > nav > ul > li:last-of-type'
            )
              .prev()
              .children('a')
              .attr('href'),
            host
          ).searchParams.get('p')
        : new URL(
            content('body > div.container > div.center > ul > li.next')
              .prev()
              .children('a')
              .attr('href'),
            host
          ).searchParams.get('p')
    ) || 1

  const result: SearchResult = {
    current_page,
    last_page,
    torrents: content(
      'body > div.container > div.table-responsive > table > tbody'
    )
      .children('tr')
      .map(parseSearch)
      .get()
  }

  return result

  // // const table = page(
  // //   'body > div.container > div.table-responsive > table > tbody'
  // // )

  // const files = table
  //   .children('tr')
  //   .map((i, el) => {
  //     const select = cheerio(el)
  //     return {
  //       id: Number.parseInt(
  //         select('td:nth-child(2) > a:last-of-type')
  //           .attr('href')
  //           .split('/')
  //           .pop()
  //       ),
  //       category: {
  //         label: select('td:nth-child(1) > a').attr('title'),
  //         code: new URL(
  //           select('td:nth-child(1) > a').attr('href'),
  //           host
  //         ).searchParams.get('c')
  //       },
  //       name: select('td:nth-child(2) > a:last-of-type').text().trim(),
  //       links: {
  //         page: select('td:nth-child(2) > a:last-of-type').attr('href'),
  //         file: select('td:nth-child(3) > a').attr('href'),
  //         magnet: select('td:nth-child(3) > a:last-of-type').attr('href')
  //       },
  //       file_size: select('td:nth-child(4)').text(),
  //       file_size_bytes: bytes.parse(select('td:nth-child(4)').text()),
  //       timestamp: Number.parseInt(
  //         select('td:nth-child(5)').attr('data-timestamp')
  //       ),
  //       stats: {
  //         downloaded: Number.parseInt(select('td:nth-child(8)').text()),
  //         seeders: Number.parseInt(select('td:nth-child(6)').text()),
  //         leechers: Number.parseInt(select('td:nth-child(7)').text())
  //       },
  //       entry: getEntry(el.attribs.class)
  //     }
  //   })
  //   .get()

  // return {
  //   current_page,
  //   last_page,
  //   files
  // }
}

export const parseTorrent = (id: number, html: string): ViewTorrent => {
  const content = ((cheerio as unknown) as typeof ch).load(html)

  content('.servers-cost-money1').remove()

  const entryMatch = content('body > div.container > div:first-of-type').attr(
    'class'
  )

  return {
    id: id,
    name: content(
      'body > div.container > div.panel:first-of-type > div.panel-heading > h3'
    )
      .text()
      .trim(),
    file_size: content(
      'body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(2)'
    ).html(),
    file_size_bytes: bytes.parse(
      content(
        'body > div.container > div.panel > div.panel-body > div:nth-child(4) > div:nth-child(2)'
      ).html()
    ),
    category: content(
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
      torrent: content(
        'body > div.container > div.panel > div:last-of-type > a:first-of-type'
      ).attr('href'),
      magnet: content(
        'body > div.container > div.panel > div:last-of-type > a:last-of-type'
      ).attr('href')
    },
    timestamp:
      Number.parseInt(
        content(
          'body > div.container > div.panel > div.panel-body > div:nth-child(1) > div:nth-child(4)'
        ).attr('data-timestamp')
      ) * 1000,
    submitter: content(
      'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a'
    ).html()
      ? {
          name: content(
            'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a'
          ).html(),
          link: content(
            'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(2) > a'
          ).attr('href')
        }
      : {
          name: 'Anonymous',
          link: null
        },
    description: content('#torrent-description').html(),
    info:
      content(
        'body > div.container > div.panel > div.panel-body > div:nth-child(3) > div:nth-child(2) a'
      ).attr('href') || 'No information',
    info_hash: content(
      'body > div.container > div.panel > div.panel-body > div:nth-child(5) > div.col-md-5 > kbd'
    ).html(),
    stats: {
      seeders: Number.parseInt(
        content(
          'body > div.container > div.panel > div.panel-body > div:nth-child(2) > div:nth-child(4) > span'
        ).html()
      ),
      leechers: Number.parseInt(
        content(
          'body > div.container > div.panel > div.panel-body > div:nth-child(3) > div:nth-child(4) > span'
        ).html()
      ),
      downloaded: Number.parseInt(
        content(
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
