import { Nyaa } from '../src'
import fs from 'fs'
import path from 'path'

require('dotenv').config('../.env')

// const sessionPath = path.join(__dirname, '..', 'session')

// const pathExists = async (path: string): Promise<boolean> => {
//   try {
//     await fs.promises.access(path, fs.constants.F_OK)
//     return true
//   } catch {
//     return false
//   }
// }

export const getTestClient = async (): Promise<Nyaa> => {
  return new Nyaa()
}

export const getAuthenticatedTestClient = async (): Promise<Nyaa> => {
  const client = new Nyaa()

  // if (await pathExists(sessionPath)) {
  //   await client.agent.loginWithSession(sessionPath)
  // } else {
  //   await client.agent.login(
  //     process.env.NYAA_USERNAME,
  //     process.env.NYAA_PASSWORD
  //   )
  //   await client.agent.saveSession(sessionPath)
  // }
  return client
}
