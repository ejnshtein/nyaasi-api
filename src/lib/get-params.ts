import { SearchQuery, SearchParams } from '../../types/agent'
import { deepmerge } from './deepmerge'

export const DefaultSearchParams: SearchParams = {
  q: '',
  f: 0,
  c: '0_0'
}

export const buildCategory = ({
  category,
  subcategory
}: {
  category?: number | string
  subcategory?: number
}): string => {
  if (typeof category === 'string') {
    return category
  }

  category = typeof category === 'number' ? category : 0
  subcategory = typeof subcategory === 'number' ? subcategory : 0

  return `${category}_${subcategory}`
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
    c: buildCategory(query)
  })
}
