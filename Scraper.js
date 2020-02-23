import cheerio from 'cheerio'
import bytes from 'bytes-iec'

export const getCSRFToken = html => {
  const selector = cheerio.load(html)

  return selector('#csrf_token').attr('value')
}

export const parseProfile = html => {
  const selector = cheerio.load(html)

  if (selector('title').text().toLowerCase().includes('redirecting')) {
    return null
  } else {
    const profile = {
      id: Number.parseInt(selector('body > div > div.row > div.col-sm-10 > dl > dd:nth-child(2)').text()),
      username: selector('body > div > h2 > .text-default').text(),
      avatar: selector('body > div > div.row > div.col-sm-2 > img').attr('src'),
      class: selector('body > div > div.row > div.col-sm-10 > dl > dd:nth-child(4)').text(),
      created_at: new Date(selector('body > div > div.row > div.col-sm-10 > dl > dd:nth-child(6)').text())
    }
    return profile
  }
}

export const parseComments = html => {
  const select = cheerio.load(html)
  return select('#collapse-comments > div.panel')
    .map((i, el) => {
      const commentSelector = cheerio.load(el)
      return {
        id: Number.parseInt(
          commentSelector('.panel-body > .comment > .comment-body > .comment-content')
            .attr('id')
            .match(/torrent-comment([0-9]+)/i)[1]
        ),
        from: {
          username: commentSelector('.panel-body > .col-md-2 > p > a').text(),
          avatar: commentSelector('.panel-body > .col-md-2 > img').attr('src')
        },
        timestamp: Number.parseInt(
          commentSelector('.panel-body > .comment > .comment-details > a > small').attr('data-timestamp')
        ) * 1000,
        publish_date: new Date(
          Number.parseInt(
            commentSelector('.panel-body > .comment > .comment-details > a > small').attr('data-timestamp')
          ) * 1000
        ),
        text: commentSelector('.panel-body > .comment > .comment-body > .comment-content').html()
      }
    })
    .get()
}

export const parseSearch = (host = 'https://nyaa.si', html) => {
  const page = cheerio.load(html)
  const table = page('body > div.container > div.table-responsive > table > tbody')
  const files = table.children('tr').map((i, el) => {
    const select = cheerio.load(el)
    return {
      id: Number.parseInt(
        select('td:nth-child(2) > a:last-of-type')
          .attr('href')
          .split('/').pop()
      ),
      category: {
        label: select('td:nth-child(1) > a').attr('title'),
        code: new URL(
          select('td:nth-child(1) > a').attr('href'), host
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
        select('td:nth-child(5)')
          .attr('data-timestamp')
      ),
      stats: {
        downloaded: Number.parseInt(select('td:nth-child(8)').text()),
        seeders: Number.parseInt(select('td:nth-child(6)').text()),
        leechers: Number.parseInt(select('td:nth-child(7)').text())
      },
      entry: getEntry(el.attribs['class'])
    }
  }).get()
  const current_page = Number.parseInt(
    page('body > div.container > div.center > nav > ul').html()
      ? new URL(page('body > div.container > div.center > nav > ul > li.active > a').attr('href'), host).searchParams.get('p')
      : page('body > div.container > div.center > ul > li.active').text()
  ) || 1
  const last_page = Number.parseInt(
    page('body > div.container > div.center > nav > ul').html()
      ? new URL(page('body > div.container > div.center > nav > ul > li:last-of-type').prev().children('a').attr('href'), host).searchParams.get('p')
      : new URL(page('body > div.container > div.center > ul > li.next').prev().children('a').attr('href'), host).searchParams.get('p')
  ) || 1
  return {
    current_page,
    last_page,
    files
  }
}

function getEntry (entry) {
  switch (entry) {
    case 'danger':
      return '[Remake]'
    case 'success':
      return '[Trusted]'
    default:
      return ''
  }
}
