const user = require('./user/config')
module.exports = Object.freeze({
  defaultLanguage: 'ru',
  states: {
    EMPTY: 0,
    JAD_BET_CHANCE: 1,
    JAD_BET_SIZE: 2
  },
  user,
  routes: {
    start: '/start',
    get: '/get',
    drop: '/dropDB',
    help: '/help',
    set: '/set*',
    balance: '/balance'
  },
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
  }
})
