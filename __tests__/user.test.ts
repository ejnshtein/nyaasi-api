import { getAuthenticatedTestClient } from '../jest/get-test-client'

describe('user api', () => {
  it('should get me', async () => {
    return // disabled for now
    const client = await getAuthenticatedTestClient()
    const { username } = await client.getMe()
    expect(username).toEqual(process.env.NYAA_USERNAME)
  })
})
