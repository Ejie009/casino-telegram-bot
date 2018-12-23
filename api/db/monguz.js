const cfg = require('./config')
const mongoose = require('mongoose')
const handleError = err => {
  if (err) throw err
}

mongoose.connect(
  cfg.url,
  err => handleError(err)
)

let db = mongoose.connection

const userSchema = new mongoose.Schema({
  [cfg.user.uid]: Number,
  [cfg.user.name]: String,
  [cfg.user.balance]: Number,
  [cfg.user.state]: Number,
  [cfg.user.current_bet]: {
    [cfg.user.bet_chance]: Number,
    [cfg.user.bet_size]: Number
  },
  [cfg.user.language]: String
})

const User = mongoose.model('User', userSchema)

const dump = () => db.dropCollection(cfg.table, err => handleError(err))

const insert = user => User.create(user, err => handleError(err))

const updateState = (id, newState) =>
  User.update(
    { [cfg.user.uid]: id },
    { $set: { [cfg.user.state]: newState } },
    err => handleError(err)
  )

const updateBet = (id, newBet) =>
  User.update(
    { [cfg.user.uid]: id },
    { $set: { [cfg.user.current_bet]: newBet } },
    err => handleError(err)
  )

const updateBetSize = (id, newBetSize) =>
  User.update(
    { [cfg.user.uid]: id },
    { $set: { [cfg.user.current_bet + '.' + cfg.user.bet_size]: newBetSize } },
    err => handleError(err)
  )

const updateBetChance = (id, newBetChance) =>
  User.update(
    { [cfg.user.uid]: id },
    {
      $set: { [cfg.user.current_bet + '.' + cfg.user.bet_chance]: newBetChance }
    },
    err => handleError(err)
  )

const updateBalance = (id, newBalance) =>
  User.update(
    { [cfg.user.uid]: id },
    { $set: { [cfg.user.balance]: newBalance } },
    err => handleError(err)
  )

const clearBet = (id, newBalance) =>
  User.update(
    { [cfg.user.uid]: id },
    {
      $set: {
        [cfg.user.balance]: newBalance,
        [cfg.user.state]: 0,
        [cfg.user.current_bet + '.' + cfg.user.bet_chance]: 0,
        [cfg.user.current_bet + '.' + cfg.user.bet_size]: 0
      }
    },
    err => handleError(err)
  )

const get = callback =>
  User.find((err, res) => {
    handleError(err)
    callback(res)
  })

const getByFilter = (filter, callback) =>
  User.findOne(filter, (err, res) => {
    handleError(err)
    callback(res)
  })

const getOne = (id, callback) =>
  User.findOne({ [cfg.user.uid]: id }, (err, res) => {
    handleError(err)
    callback(res)
  })

const getPlayers = callback =>
  User.find(
    { [cfg.user.admin]: false },
    { projection: { [cfg.user.admin]: 0 } },
    (err, res) => {
      handleError(err)
      callback(res)
    }
  )

const getAdmins = callback =>
  User.find(
    { [cfg.user.admin]: true },
    { projection: { [cfg.user.admin]: 0 } },
    (err, res) => {
      handleError(err)
      callback(res)
    }
  )

module.exports = {
  clearBet,
  dump,
  get,
  getOne,
  getByFilter,
  getAdmins,
  getPlayers,
  insert,
  updateBalance,
  updateBetSize,
  updateBetChance,
  updateBet,
  updateState
}
