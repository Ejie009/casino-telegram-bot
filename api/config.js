module.exports = Object.freeze({
  callbacks: {
    game: {
      start: 'cbStart',
      end: 'cbEnd',
      jad: 'cbJad',
      poker: 'cbPoker',
      balance: 'cbBalance'
    }
  },
  game: {
    jad: 'jad',
    poker: 'poker'
  },
  defaultLanguage: 'ru',
  languages: {
    ru: 'ru',
    en: 'en'
  },
  states: {
    STATE_EMPTY: 0,
    STATE_JAD_BET_CHANCE: 1,
    STATE_JAD_BET_SIZE: 2
  },
  routes: {
    start: '/start',
    get: '/get',
    dump: '/dumpDb',
    help: '/help',
    set: '/set*',
    balance: '/balance'
  },
})
