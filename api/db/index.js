const cfg = require('./config')
const mongoose = require('mongoose')

const handleError = err => {
  if (err) throw err
}

mongoose.connect(
  cfg.url,
  err => handleError(err)
)

const userSchema = new mongoose.Schema({
  [cfg.user.uid]: Number,
  [cfg.user.name]: String,
  [cfg.user.balance]: Number,
  [cfg.user.state]: Number,
  [cfg.user.bet]: {
    [cfg.user.chance]: Number,
    [cfg.user.size]: Number
  },
  [cfg.user.language]: String
})

const User = mongoose.model('User', userSchema)

const drop = () => mongoose.connection.dropCollection(cfg.table)

const insert = user => User.create(user)

const updateState = (id, newState) =>
  User.updateOne({ [cfg.user.uid]: id }, { $set: { [cfg.user.state]: newState } }).exec()

const updateBet = (id, newBet) =>
  User.updateOne({ [cfg.user.uid]: id }, { $set: { [cfg.user.bet]: newBet } }).exec()

const updateBetSize = (id, newBetSize) =>
  User.updateOne(
    { [cfg.user.uid]: id },
    { $set: { [cfg.user.bet + '.' + cfg.user.size]: newBetSize } }
  ).exec()

const updateBetChance = (id, newBetChance) =>
  User.updateOne(
    { [cfg.user.uid]: id },
    {
      $set: { [cfg.user.bet + '.' + cfg.user.chance]: newBetChance }
    }
  ).exec()

const updateBalance = (id, newBalance) =>
  User.updateOne({ [cfg.user.uid]: id }, { $set: { [cfg.user.balance]: newBalance } }).exec()

const clearBet = (id, newBalance) =>
  User.updateOne(
    { [cfg.user.uid]: id },
    {
      $set: {
        [cfg.user.balance]: newBalance,
        [cfg.user.state]: 0,
        [cfg.user.bet + '.' + cfg.user.chance]: 0,
        [cfg.user.bet + '.' + cfg.user.size]: 0
      }
    }
  ).exec()

const get = () => User.find().exec()

const getByFilter = filter => User.findOne(filter).exec()

const getOne = id => User.findOne({ [cfg.user.uid]: id }).exec()

const getPlayers = () =>
  User.find({ [cfg.user.admin]: false }, { projection: { [cfg.user.admin]: 0 } }).exec()

const getAdmins = () =>
  User.find({ [cfg.user.admin]: true }, { projection: { [cfg.user.admin]: 0 } }).exec()

module.exports = {
  clearBet,
  drop,
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
