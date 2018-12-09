const express = require('express');
const Telegraf = require('telegraf');
const Core = require('./core');
const bot = new Telegraf(process.env.BOT_TOKEN, { telegram:{ webhookReply:false } });

bot.start(Core.onStart);

bot.hears(/\/get/, Core.onGetList);
bot.hears(/\/db_drop/, Core.dumpDB);
bot.hears(/\/help/, Core.onHelp);
bot.hears(/\/set*/, Core.onSetBalance)
bot.hears(/\/balance/, Core.onBalance)

bot.on("text", Core.textHandler);
bot.on("callback_query", Core.callbackHandler);

bot.telegram.setWebhook(process.env.SERVER_URL+process.env.SECRET_PATH)

const app = express();
app.get('/', (req, res) => res.send('Hello World!'))
app.use(bot.webhookCallback(process.env.SECRET_PATH))
app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})