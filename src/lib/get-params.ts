import { SearchQuery, SearchParams } from '../../types/agent'
import { deepmerge } from './deepmerge'

export const DefaultSearchParams: SearchParams = {
  q: '',
  f: 0,
  c: '0_0'
}

export const getParams = (query: string | SearchQuery): SearchParams => {
  if (typeof query === 'string') {
    return deepmerge(DefaultSearchParams, {
      q: query
    })
  }

  return deepmerge(DefaultSearchParams, {
    q: query.title,
    f: typeof query.filter === 'number' ? query.filter : 0,
    c: query.category
  })
}
