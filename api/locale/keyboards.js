const Markup = require('telegraf/markup')
const cfg = require('./config')
const locale = require('./locale')

module.exports = {
  hello: lang =>
    Markup.inlineKeyboard([
      Markup.callbackButton(
        locale.callbacks.startGame[lang],
        cfg.callbacks.game.start
      ),
      Markup.callbackButton(
        locale.callbacks.getBalance[lang],
        cfg.callbacks.game.balance
      )
    ]).extra(),

  play: Markup.inlineKeyboard([
    Markup.callbackButton(cfg.game.jad, cfg.callbacks.game.jad),
    Markup.callbackButton(cfg.game.poker, cfg.callbacks.game.poker)
  ]).extra(),

  jad: {
    chance: Markup.keyboard([['50'], ['25', '10', '5']])
      .oneTime()
      .resize()
      .extra(),
    size: balance => {
      return Markup.keyboard([
        [balance.toString()],
        [(balance / 2).toString(), (balance / 4).toString()],
        [(balance / 10).toString()]
      ])
        .oneTime()
        .resize()
        .extra()
    }
  }
}
