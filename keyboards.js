const Markup = require("telegraf/markup");
const config = require("./config");
const locale = require("./locale");

module.exports = {
  hello: lang =>
    Markup.inlineKeyboard([
      Markup.callbackButton(
        locale.callbacks.startGame[lang],
        config.callbacks.game_start
      ),
      Markup.callbackButton(
        locale.callbacks.getBalance[lang],
        config.callbacks.game_balance
      )
    ]).extra(),

  play: Markup.inlineKeyboard([
    Markup.callbackButton(config.game.jad, config.callbacks.game_jad),
    Markup.callbackButton(config.game.poker, config.callbacks.game_poker)
  ]).extra(),

  jad: {
    bet_chance: Markup.keyboard([["50"], ["25", "10", "5"]])
      .oneTime()
      .resize()
      .extra(),
    bet_size: balance => {
      return Markup.keyboard([
        [balance.toString()],
        [(balance / 2).toString(), (balance / 4).toString()],
        [(balance / 10).toString()]
      ])
        .oneTime()
        .resize()
        .extra();
    }
  }
};
