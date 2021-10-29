import fs from 'fs'
import path from 'path'
import { getTestClient } from '../jest/get-test-client'
// import { parseSearch, parseTorrent } from '../src/Scraper'

const saveResultToFile = <T>(result: T, filename: string) =>
  fs.promises.writeFile(
    path.join(process.cwd(), '.tmp', filename),
    JSON.stringify(result, null, 2),
    'utf-8'
  )

/**
 * TODO add more tests
 */
describe('nyaa api', () => {
  it('should search for Kotonoha no Niwa rip by beatrice-raws', async () => {
    const client = await getTestClient()
    const result = await client.search({
      title: 'Kotonoha no Niwa',
      category: '1_2'
    })

    await saveResultToFile(result, 'search.test.json')

    expect(
      result.torrents.some(
        (torrent) =>
          torrent.name ===
          '[Beatrice-Raws] Kotonoha no Niwa [BDRip 1920x1080 x264 FLAC]'
      )
    ).toEqual(true)
  })

  it('should get Kotonoha no Niwa torrent anonymously', async () => {
    const client = await getTestClient()
    const result = await client.getTorrentAnonymous(890127)

    await saveResultToFile(result, 'torrent.test.json')

    expect(result.submitter.name).toEqual('DJATOM')
  })
})
