export interface ApiTorrent {
  id: number
  name: string
  url: string
  submitter: string
  description: string
  information: string
  is_complete: boolean
  is_remake: boolean
  is_trusted: boolean
  main_category: string
  main_category_id: number
  sub_category: string
  sub_category_id: number
  hash_b32: string
  hash_hex: string
  files: {
    [x as string]: number
  }
  filesize: number
  magnet: string
  stats: {
    downloads: number
    leechers: number
    seeders: number
  }
  creation_date: string
  comments?: TorrentComment[]
}

export interface ViewTorrent {
  id: number
  name: string
  file_size: string
  file_size_bytes: string
  category: {
    title: string
    code: string
  }[]
  entry: '[Remake]' | '[Trusted]' | ''
  links: {
    torrent: string
    magnet: string
  }
  timestamp: number
  submitter: {
    name: string
    link: string | null
  }
  description: string
  info: string
  info_hash: string
  stats: {
    seeders: number
    leechers: number
    downloaded: number
  }
  comments?: TorrentComment[]
}

export interface UserProfile {
  id: number
  username: string
  avatar: string
  class: string
  created_at: Date
}

export interface TorrentComment {
  id: number
  from: {
    username: string
    avatar: string
  }
  timestamp: number
  publish_date: Date
  text: string
}

export interface SearchResult {
  current_page: number
  last_page: number
  files: SearchResultFiles[]
}

export interface SearchResultFiles {
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
  file_size_bytes: string
  timestamp: number
  stats: {
    dowloaded: number
    seeders: number
    leechers: number
  }
  entry: '[Remake}' | '[Trusted]' | ''
}
