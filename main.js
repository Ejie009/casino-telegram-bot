const express = require('express')
const Telegraf = require('telegraf')
const Core = require('./api/core')
const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: { webhookReply: false }
})

bot.on('text', Core.textHandler)
bot.on('callback_query', Core.callbackHandler)

bot.telegram.setWebhook(process.env.SERVER_URL + process.env.SECRET_PATH)

const app = express()
app.get('/', (req, res) => res.send('Hello World!'))
app.use(bot.webhookCallback(process.env.SECRET_PATH))
app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
