import { Cookie } from '../../types/agent'

export const parseCookies = (cookies: string[]): Cookie[] =>
  cookies.map((cookie) =>
    cookie.split('; ').reduce((cookie, property) => {
      switch (true) {
        case property.toLowerCase().includes('domain'): {
          return {
            ...cookie,
            domain: property.split('=').pop()
          }
        }
        case property.toLowerCase().includes('expires'): {
          return {
            ...cookie,
            expires: new Date(property.split('=').pop())
          }
        }
        case property.toLowerCase().includes('httponly'): {
          return {
            ...cookie,
            httponly: true
          }
        }
        case property.includes('='): {
          return property.split('=').map((el, i) => {
            if (i === 0) {
              return el.toLowerCase()
            }
            return el
          })
        }
      }
      return cookie
    }, {})
  )

export const cookiesToString = (cookies: Cookie[]): string[] =>
  cookies.map((cookie) => {
    const [name] = Object.keys(cookie).filter(
      (key) => !['domain', 'httponly', 'expires', 'path'].includes(key)
    )
    return `${name}=${cookie[name]}`
  })
