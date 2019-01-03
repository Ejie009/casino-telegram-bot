const user = require('./user')
const locale = require('./locale')
module.exports = Object.freeze({
  ...locale,
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
  }
})
