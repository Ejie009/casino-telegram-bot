const cfg = require('./config')
const create = (uid, name, balance, state, betChance, betSize) => ({
  [cfg.uid]: uid,
  [cfg.name]: name,
  [cfg.balance]: balance,
  [cfg.state]: state,
  [cfg.bet]: {
    [cfg.chance]: betChance,
    [cfg.size]: betSize
  },
  [cfg.language]: cfg.defaultLanguage
})

const createDefault = (uid, name) => create(uid, name, 500, 0, 0, 0)

module.exports = {
  create,
  createDefault
}
