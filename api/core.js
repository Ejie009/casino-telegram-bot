'use strict'


function Core() {
  const db = require('/api/db/monguz')
  const cfg = require('../config')
  const keyboards = require('../locale/keyboards')
  const locale = require('../locale/locale')

  const doMap = {
    [cfg.routes.start]: onStart,
    [cfg.routes.get]: onGetList,
    [cfg.routes.dump]: dumpDB,
    [cfg.routes.help]: onHelp,
    [cfg.routes.set]: onSetBalance,
    [cfg.routes.balance]: onBalance
  }

  async function onStart(ctx) {
    let lang = await userExist(ctx.message.from.id)
      ? await db.dbGetUserLanguage(ctx.message.from.id)
      : cfg.defaultLanguage
    if (exists) {
      ctx.reply(
        locale.helloBro[lang](ctx.message.from.first_name),
        keyboards.hello(lang)
      )
    } else {
      ctx.reply(locale.helloWho[lang], keyboards.hello(lang))
      db.dbInsertPlayer(
        userWrapper(
          ctx.message.from.id,
          ctx.message.from.first_name,
          500,
          0,
          0,
          0
        )
      )
    }
  }

  function userWrapper(uid, name, balance, state, bet_chance, bet_size) {
    return {
      [cfg.user.uid]: uid,
      [cfg.user.name]: name,
      [cfg.user.balance]: balance,
      [cfg.user.state]: state,
      [cfg.user.current_bet]: {
        [cfg.user.bet_chance]: bet_chance,
        [cfg.user.bet_size]: bet_size
      },
      [cfg.user.language]: cfg.languages.ru
    }
  }

  async function callbackHandler(ctx) {
    console.log(ctx.update.callback_query.from.id)
    let lang = await db.dbGetUserLanguage(
      ctx.update.callback_query.from.id
    )
    console.log(lang)
    switch (ctx.update.callback_query.data) {
    case cfg.callbacks.game_start:
      ctx.reply(locale.callbacks.letsPlay[lang], keyboards.play)
      break
    case cfg.callbacks.game_jad:
      let player = await db.dbGetUserById(
        ctx.update.callback_query.from.id
      )
      if (player.balance === 0) {
        ctx.reply(locale.callbacks.fuckYou[lang])
      } else {
        ctx.reply(locale.state.tellBetChance[lang], keyboards.jad.bet_chance)
        db.dbChangePlayerState(
          ctx.update.callback_query.from.id,
          cfg.states.STATE_JAD_BET_CHANCE
        )
      }
      break
    case cfg.callbacks.game_poker:
      ctx.reply(locale.pokerDevelop[lang])
      break
    case cfg.callbacks.game_balance:
      ctx.reply(await onBalance(ctx.update.callback_query.from.id))
    }
  }

  async function textHandler(ctx) {
    if (middleWareHandler(ctx)) {
      return
    }
    if (!(await userExist(ctx.message.from.id))) {
      console.log('WTF')
      ctx.reply(locale.errors.unknownUser[cfg.defaultLanguage])
      return
    }
    let user = await db.dbGetUserById(ctx.message.from.id)

      
    let lang = user[cfg.user.language]
    let result
    console.log(user.state)
    switch (user[cfg.user.state]) {
    case cfg.states.STATE_EMPTY:
      ctx.reply(locale.errors.dontUnderstand[lang])
      break
    case cfg.states.STATE_JAD_BET_CHANCE:
      result = ctx.message.text.match(/\d+/)
      if (!/\d+(\.\d+)?/gm.test(ctx.message.text) || result.length !== 1) {
        ctx.reply(locale.errors.dontUnderstand[lang])
        return
      }
      if (result[0] <= 0 || result[0] >= 100) {
        ctx.reply(locale.errors.wrongNumber[lang])
        return
      }
      db.dbUpdatePlayerBetChance(
        ctx.message.from.id,
        parseFloat(result[0])
      )
      await db.dbChangePlayerState(
        ctx.message.from.id,
        cfg.states.STATE_JAD_BET_SIZE
      )
      ctx.reply(
        locale.state.tellBetSize[lang],
        keyboards.jad.bet_size(
          (await db.dbGetUserById(ctx.message.from.id))[
            cfg.user.balance
          ]
        )
      )
      break
    case cfg.states.STATE_JAD_BET_SIZE:
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
      await db.dbUpdatePlayerBetSize(ctx.message.from.id, betSize)
      let newUser = await db.dbGetUserById(ctx.message.from.id)
      if (betSize <= 0) {
        ctx.reply(locale.errors.wrongBet[lang])
        return
      }
      if (betSize > newUser[cfg.user.balance]) {
        ctx.reply(locale.errors.wrongNumber[lang])
        return
      }
      db.dbUpdatePlayerBalance(
        ctx.message.from.id,
        parseFloat((newUser[cfg.user.balance] - betSize).toFixed(3))
      )

      let win = processBet(newUser[cfg.user.current_bet])
      await ctx.reply(locale.state.calculatingBet[lang])
      if (win === 0) {
        ctx.reply(locale.state.tellLose[lang], keyboards.play)
        return
      } else {
        ctx.reply(
          locale.state.tellCongratulations(
            win,
            newUser[cfg.user.current_bet][cfg.user.bet_chance]
          )
        )
        db.dbUpdatePlayerBalance(
          ctx.message.from.id,
          newUser[cfg.user.balance] + win
        )
      }
      db.dbChangePlayerState(
        ctx.message.from.id,
        cfg.states.STATE_EMPTY
      )
      break
    default:
      console.log('nthng')
    }
  }

  function processBet(bet) {
    return Math.random() * 100 < bet[cfg.user.bet_chance]
      ? (bet[cfg.user.bet_size] * 100) / bet[cfg.user.bet_chance]
      : 0
  }

  async function onHelp(ctx) {
    ctx.reply(
      locale.help[await db.dbGetUserLanguage(ctx.message.from.id)]
    )
  }

  async function onGetList(ctx) {
    ctx.reply(await db.dbGetPlayers())
  }

  async function checkAdmin(uid) {
    let query = await db.dbGetUserById(uid)
    return !!query
  }

  async function userExist(uid) {
    let query = await db.dbGetUserById(uid)
    console.log('query:', !!query)
    return !!query
  }

  async function onBalance(ctx) {
    ctx.reply(
      locale.balance['ru'](
        (await db.dbGetUserById(ctx.message.from.id))[
          cfg.user.balance
        ]
      )
    )
  }

  async function onSetBalance(ctx) {
    let res = ctx.message.text.match(/\w+/gm)
    console.log(res)
    if (res.length !== 3)
      ctx.reply(
        locale.errors.dontUnderstand[
          await db.dbGetUserLanguage(ctx.message.from.id)
        ]
      )
    else db.dbUpdatePlayerBalance(parseInt(res[1]), parseFloat(res[2]))
  }

  function dumpDB() {
    return db.dbDump()
  }

  function middleWareHandler(ctx) {
    if (ctx.message === undefined) return false
    let completed = false
    Object.keys(doMap).forEach(key => {
      if (new RegExp(key, 'gm').test(ctx.message.text)) {
        console.log('hi')
        doMap[key](ctx)
        completed = true
      }
    })
    return completed
  }

  return {
    middleWareHandler,
    onSetBalance,
    onBalance,
    onStart,
    onGetList,
    onHelp,
    dumpDB,
    callbackHandler,
    textHandler
  }
}

module.exports = Core()
