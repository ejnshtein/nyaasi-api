import deepmerge from 'deepmerge'
import { Agent } from './Agent.js'
import { NyaaRss } from './NyaaRss.js'
import { parseComments, parseSearch } from './Scraper.js'

const DefaultOptions = {
  host: 'https://nyaa.si',
  apiHost: 'https://nyaa.si/api'
}

class Nyaa {
  constructor (options) {
    this.options = Object.assign({}, DefaultOptions, options)
    this.agent = new Agent(this.options)
  }

  async getMe () {
    return this.agent.checkLogin()
  }

  async search (query, options = { filter: 0, category: '0_0' }, params = {}) {
    const search = {
      q: query,
      f: (typeof options.filter !== 'undefined' && options.filter) || 0,
      c: (typeof options.filter !== 'undefined' && options.category) || '0_0'
    }
    const result = await this.agent.call(
      '',
      deepmerge.all(
        [
          {
            params: search
          },
          params
        ]
      )
    )

    return parseSearch(this.options.host, result)
  }

  static async search (query, options = { filter: 0, category: '0_0' }, params = {}) {
    const search = {
      q: query,
      f: (typeof options.filter !== 'undefined' && options.filter) || 0,
      c: (typeof options.filter !== 'undefined' && options.category) || '0_0'
    }
    const result = await Agent.call(
      '',
      deepmerge.all(
        [
          {
            params: search
          },
          params
        ]
      )
    )

    return parseSearch(params.baseUrl || 'https://nyaa.si', result.data)
  }

  async getTorrent (id, options = { withComments: false }) {
    const result = await this.agent.callApi(`info/${id}`)
    if (options.comments) {
      const comments = await this.agent.call(`view/${id}`)
        .then(parseComments)

      result.comments = comments
    }
    return result
  }

  static async getTorrent (id, options = { withComments: false }, params = {}) {
    const result = await Agent.callApi(`info/${id}`, params)
    if (options.comments) {
      const comments = await Agent.call(`view/${id}`, params)
        .then(parseComments)

      result.comments = comments
    }
    return result.data
  }
}

export {
  Agent,
  Nyaa,
  NyaaRss
}

export default Nyaa
