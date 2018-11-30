const express = require('express');
const Telegraf = require('telegraf');
const Core = require('./core');
const bot = new Telegraf(process.env.BOT_TOKEN, {telegram:{webhookReply:false}});

bot.start((ctx) => Core.onStart(ctx));

bot.hears(/\/get/, (ctx) => Core.onGetList(ctx));
bot.hears(/\/db_drop/, Core.dumpDB);
bot.hears(/\/help/, (ctx) => Core.onHelp(ctx));

bot.on("text", (ctx) => Core.textHandler(ctx));
bot.on("callback_query", (ctx) => Core.callbackHandler(ctx));

bot.telegram.setWebhook(process.env.SERVER_URL+process.env.SECRET_PATH)

const app = express();
app.get('/', (req, res) => res.send('Hello World!'))
app.use(bot.webhookCallback(process.env.SECRET_PATH))
app.listen(3000, () => {
    console.log('Example app listening on port 3000!')
})