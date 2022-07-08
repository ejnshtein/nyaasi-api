# @ejnshtein/nyaasi

[![NPM Version](https://img.shields.io/npm/v/@ejnshtein/nyaasi.svg?style=flat-square)](https://www.npmjs.com/package/@ejnshtein/nyaasi)
[![npm downloads](https://img.shields.io/npm/dm/@ejnshtein/nyaasi.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@ejnshtein/nyaasi)
[![License](https://img.shields.io/npm/l/@ejnshtein/nyaasi?style=flat-square)](https://github.com/ejnshtein/nyaasi)
[![codecov](https://codecov.io/gh/ejnshtein/nyaasi-api/branch/master/graph/badge.svg)](https://codecov.io/gh/ejnshtein/nyaasi-api)

This is unofficial [Nyaa.si](https://nyaa.si) website api wrapper.

## Installation

```bash
npm i @ejnshtein/nyaasi

# or

yarn add @ejnshtein/nyaasi
```

## Example

```js
const { Nyaa } = require('@ejnshtein/nyaasi')

Nyaa.search({
  title: 'Kotonoha no Niwa',
  category: '1_2'
}).then(result => {
  console.log(`Found ${result.torrents.length} torrents.`)
})

Nyaa.getTorrentAnonymous(890127)
  .then(torrent => {
    console.log(`Torrent is made by ${torrent.submitter.name}`)
    console.log(`Stats: ${torrent.stats.seeders} seeders, ${torrent.stats.leechers} leechers and ${torrent.stats.downloaded} downloads.`)
    console.log(`Magnet link: ${torrent.links.magnet}`)
  })

```

## API

API section is available on the [website](https://ejnshtein.github.io/nyaasi-api/).


---

## Contact

[My telegram](https://t.me/ejnshtein) and a [group](https://t.me/nyaasi_chat) where you can ask your questions or suggest something.
