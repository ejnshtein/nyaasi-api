import { getTestClient } from '../jest/get-test-client'

/**
 * TODO add more tests
 */
describe('nyaa api', () => {
  it('should search for Kotonoha no Niwa rip by beatrice-raws', async () => {
    const client = await getTestClient()
    const result = await client.search('Kotonoha no Niwa', { category: '1_2' })

    expect(
      result.files.some(
        (file) =>
          file.name ===
          '[Beatrice-Raws] Kotonoha no Niwa [BDRip 1920x1080 x264 FLAC]'
      )
    ).toEqual(true)
  })

  it('should get Kotonoha no Niwa torrent from api', async () => {
    const client = await getTestClient()
    const result = await client.getTorrent(890127)

    expect(result.submitter.name).toEqual('DJATOM')
  })

  it('should get Kotonoha no Niwa torrent anonymously', async () => {
    const client = await getTestClient()
    const result = await client.getTorrentAnonymous(890127)

    expect(result.submitter.name).toEqual('DJATOM')
  })
})
