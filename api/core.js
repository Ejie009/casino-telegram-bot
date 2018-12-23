'use strict'

function Core() {
  const db = require('./db/monguz')
  const cfg = require('./config')
  const keyboards = require('./locale/keyboards')
  const locale = require('./locale/locale')
  const User = require('./user/user')
  const {Jad} = require('./games/export')

  const Router = {
    [cfg.routes.start]: start,
    [cfg.routes.get]: getUsers,
    [cfg.routes.drop]: dropDb,
    [cfg.routes.help]: help,
    [cfg.routes.set]: setBalance,
    [cfg.routes.balance]: getBalance
  }

  async function start(ctx) {
    const user = await db.getOne(ctx.message.from.id)
    const lang = user ? user[cfg.user.language] : cfg.defaultLanguage
    ctx.reply(locale.start[lang], keyboards.hello(lang))
    if(!user)
      db.insert(
        User.createDefault(ctx.message.from.id, ctx.message.from.first_name)
      )
  }


  async function callbackHandler(ctx) {
    ctx.answerCbQuery()
    const user = await db.getOne(ctx.update.callback_query.from.id)
    const lang = user[cfg.user.language]
    switch (ctx.update.callback_query.data) {
    case cfg.callbacks.game.start:
      ctx.reply(locale.callbacks.letsPlay[lang], keyboards.play)
      break
    case cfg.callbacks.game.jad:
      if (user=== 0) {
        ctx.reply(locale.callbacks.tooPoor[lang])
      } else {
        ctx.reply(locale.state.tellBetChance[lang], keyboards.jad.chance)
        db.updateState(
          ctx.update.callback_query.from.id,
          cfg.states.JAD_BET_CHANCE
        )
      }
      break
    case cfg.callbacks.game.poker:
      ctx.reply(locale.pokerDevelop[lang])
      break
    case cfg.callbacks.game.balance:
      await getBalance(ctx)
    }
  }

  async function textHandler(ctx) {
    if (middleWareHandler(ctx)) {
      return
    }
    let user = await db.getOne(ctx.message.from.id)
    if (!user) {
      ctx.reply(locale.errors.unknownUser[cfg.defaultLanguage])
      return
    }
      
    const lang = user[cfg.user.language]
    let result
    switch (user[cfg.user.state]) {
    case cfg.states.EMPTY:
      ctx.reply(locale.errors.dontUnderstand[lang])
      break
    case cfg.states.JAD_BET_CHANCE:
      result = ctx.message.text.match(/\d+/)
      if (!/\d+(\.\d+)?/gm.test(ctx.message.text) || result.length !== 1) {
        ctx.reply(locale.errors.dontUnderstand[lang])
        return
      }
      if (result[0] <= 0 || result[0] >= 100) {
        ctx.reply(locale.errors.wrongNumber[lang])
        return
      }
      db.updateBetChance(
        ctx.message.from.id,
        parseFloat(result[0])
      )
      await db.updateState(
        ctx.message.from.id,
        cfg.states.JAD_BET_SIZE
      )
      ctx.reply(
        locale.state.tellBetSize[lang],
        keyboards.jad.size(user[cfg.user.balance]
        )
      )
      break
    case cfg.states.JAD_BET_SIZE:
      if (!/\d+(\.\d+)?/gm.test(ctx.message.text)) {
        ctx.reply(locale.errors.dontUnderstand[lang])
        return
      }
      result = ctx.message.text.match(/\d+/)
      if (result.length !== 1) {
        ctx.reply(locale.errors.dontUnderstand[lang])
        return
      }
      const betSize = parseFloat(result[0])
      await db.updateBetSize(ctx.message.from.id, betSize)
      user = await db.getOne(ctx.message.from.id)
      if (betSize > user[cfg.user.balance]) {
        ctx.reply(locale.errors.wrongNumber[lang])
        return
      }
      db.updateBalance(
        ctx.message.from.id,
        parseFloat((user[cfg.user.balance] - betSize).toFixed(3))
      )

      const win = Jad.process(user[cfg.user.bet][cfg.user.chance], betSize)
      await ctx.reply(locale.state.calculatingBet[lang])
      if (win === 0) {
        ctx.reply(locale.state.tellLose[lang], keyboards.play)
        return
      } else {
        ctx.reply(
          locale.state.tellCongratulations(
            win,
            user[cfg.user.bet][cfg.user.chance]
          )[user[cfg.user.language]]
        )
        db.updateBalance(
          ctx.message.from.id,
          user[cfg.user.balance] + win
        )
      }
      db.updateState(
        ctx.message.from.id,
        cfg.states.EMPTY
      )
      break
    }
  }

  async function help(ctx) {
    ctx.reply(
      locale.help[(await db.getOne(ctx.message.from.id))[cfg.user.language]]
    )
  }

  async function getUsers(ctx) {
    ctx.reply(await db.get())
  }

  async function getBalance(ctx) {
    const user = await db.getOne(ctx.message ? ctx.message.from.id : ctx.update.callback_query.from.id)
    ctx.reply(locale.balance[user[cfg.user.language]](user[cfg.user.balance]))
  }

  async function setBalance(ctx) {
    let res = ctx.message.text.match(/\w+/gm)
    const user = db.getOne(ctx.message.from.id)
    if (res.length !== 3)
      ctx.reply(
        locale.errors.dontUnderstand[user[cfg.user.language]]
      )
    else db.updateBalance(parseInt(res[1]), parseFloat(res[2]))
  }

  function dropDb() {
    return db.drop()
  }

  function middleWareHandler(ctx) {
    if (ctx.message === undefined) return false
    let completed = false
    Object.keys(Router).forEach(key => {
      if (new RegExp(key, 'gm').test(ctx.message.text)) {
        Router[key](ctx)
        completed = true
      }
    })
    return completed
  }

  return {
    callbackHandler,
    textHandler
  }
}

module.exports = Core()
