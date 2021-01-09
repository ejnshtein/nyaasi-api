import fs from 'fs'
import path from 'path'
import { getTestClient } from '../jest/get-test-client'
import { parseSearch, parseTorrent } from '../src/Scraper'

/**
 * TODO add more tests
 */
describe('nyaa api', () => {
  // it('search test', async () => {
  //   const pagehtml = await fs.promises.readFile(
  //     path.join(__dirname, '..', 'Browse __ Nyaa.htm'),
  //     'utf-8'
  //   )

  //   const result = parseSearch(pagehtml)

  //   expect(true).toEqual(true)
  // })

  // it('test view parser', async () => {
  //   const pagehtml = await fs.promises.readFile(
  //     path.join(__dirname, '..', 'view.htm'),
  //     'utf-8'
  //   )

  //   const result = parseTorrent(1324807, pagehtml)

  //   expect(true).toEqual(true)
  // })

  // return
  it('should search for Kotonoha no Niwa rip by beatrice-raws', async () => {
    const client = await getTestClient()
    const result = await client.search({
      title: 'Kotonoha no Niwa',
      category: '1_2'
    })

    expect(
      result.torrents.some(
        (torrent) =>
          torrent.name ===
          '[Beatrice-Raws] Kotonoha no Niwa [BDRip 1920x1080 x264 FLAC]'
      )
    ).toEqual(true)
  })

  // it('should get Kotonoha no Niwa torrent from api', async () => {
  //   return // disabled
  //   const client = await getTestClient()
  //   const result = await client.getTorrent(890127)

  //   expect(result.submitter.name).toEqual('DJATOM')
  // })

  it('should get Kotonoha no Niwa torrent anonymously', async () => {
    const client = await getTestClient()
    const result = await client.getTorrentAnonymous(890127)

    expect(result.submitter.name).toEqual('DJATOM')
  })
})
