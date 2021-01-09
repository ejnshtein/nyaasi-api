export interface Profile {
  id: number
  username: string
  avatar: string
  class: string
  created_at: Date
}

export type Entry = '[Remake]' | '[Trusted]' | null

export interface Comment {
  /**
   * Comment id
   */
  id: number

  /**
   * Commenter
   */
  from: {
    /**
     * Commenter username
     */
    username: string

    /**
     * Avatar absolute url
     */
    avatar: string
  }

  /**
   * Comment timestamp UTC
   */
  timestamp: number

  /**
   * Publish date
   */
  publish_date: Date

  /**
   * Comment text
   */
  text: string
}

// export interface ApiTorrent {
//   id: number
//   name: string
//   url: string
//   submitter: string
//   description: string
//   information: string
//   is_complete: boolean
//   is_remake: boolean
//   is_trusted: boolean
//   main_category: string
//   main_category_id: number
//   sub_category: string
//   sub_category_id: number
//   hash_b32: string
//   hash_hex: string
//   files: {
//     [x: string]: number
//   }
//   filesize: number
//   magnet: string
//   stats: {
//     downloads: number
//     leechers: number
//     seeders: number
//   }
//   creation_date: string
//   comments?: Comment[]
// }

export interface ViewTorrent {
  id: number
  name: string
  file_size: string
  file_size_bytes: number
  category: {
    label: string
    code: string
  }[]
  entry: Entry
  links: {
    torrent: string
    magnet: string
  }
  timestamp: number
  submitter: {
    name: string
    link?: string
  }
  description: string
  info: string
  info_hash: string
  stats: {
    seeders: number
    leechers: number
    downloaded: number
  }
  comments?: Comment[]
}

export interface SearchTorrent {
  id: number
  category: {
    label: string
    code: string
  }
  name: string
  links: {
    page: string
    file: string
    magnet: string
  }
  file_size: string
  file_size_bytes: number
  timestamp: number
  stats: {
    downloaded: number
    seeders: number
    leechers: number
  }
  entry: Entry
}

export interface SearchResult {
  current_page: number
  last_page: number
  torrents: SearchTorrent[]
}

export interface RSSFile {
  id: number
  title: string
  guid: string
  description: string
  pubDate: Date
  seeders: number
  leechers: number
  downloads: number
  infoHash: string
  categoryId: string
  category: string
  size: string
  comments: number
  trusted: string
  remake: string
}
