module.exports = Object.freeze({
  defaultLanguage: 'ru',
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
  languages: {
    ru: 'ru',
    en: 'en'
  },
})