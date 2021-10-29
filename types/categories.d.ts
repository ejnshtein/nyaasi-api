export interface AllCategories {
  '0_0': 'All categories'
}

export interface Anime {
  '1_0': 'Anime'
  '1_1': 'Anime - AMV'
  '1_2': 'Anime - English'
  '1_3': 'Anime - Non-English'
  '1_4': 'Anime - Raw'
}

export interface Audio {
  '2_0': 'Audio'
  '2_1': 'Audio - Lossless'
  '2_2': 'Audio - Lossy'
}

export interface Literature {
  '3_0': 'Literature'
  '3_1': 'Literature - English'
  '3_2': 'Literature - Non-English'
  '3_3': 'Literature - Raw'
}

export interface LiveAction {
  '4_0': 'Live Action'
  '4_1': 'Live Action - English'
  '4_2': 'Live Action - Idol/PV'
  '4_3': 'Live Action - Non-English'
  '4_4': 'Live Action - Raw'
}

export interface Picture {
  '5_0': 'Pictures'
  '5_1': 'Pictures - Graphics'
  '5_2': 'Pictures - Photos'
}

export interface Software {
  '6_0': 'Software'
  '6_1': 'Software - Apps'
  '6_2': 'Software - Games'
}

export type RootCategories = AllCategories &
  Anime &
  Audio &
  Literature &
  LiveAction &
  Picture &
  Software
