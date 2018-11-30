function Core() {

    const MongoFuncs = require("./dbfuncs");
    const Config = require("./config.json")
    const Extra = require('telegraf/extra')
    const Markup = require('telegraf/markup')

    const keyboard = Markup.inlineKeyboard([
        Markup.callbackButton('Начать игру️', Config.CALLBACKS.GAME_START),
        Markup.callbackButton('Delete', 'delete')
    ]);

    MongoFuncs.dbInit();

    function onStart(ctx) {
        checkUser(ctx.message.from.id).then((exists) => {
            console.log(exists);
            if(exists) ctx.reply(`Здарова бро-${ctx.message.from.first_name}!\nШо тебе надо?`, Extra.markup(keyboard));
            else {
                ctx.reply(`Дароу, ты первый раз в этом боте?\nТогда рекомендую почитать /help дабы понять как играть.
Удачи!`);
                MongoFuncs.dbInsertPlayer({
                    "uid": ctx.message.from.id,
                    "name": ctx.message.from.first_name,
                    "balance": 500,
                    "state": 0,
                    "current_bet": {
                        "bet_chance": 0,
                        "bet_size": 0
                    }
                });
            }
        });
    }

    function callbackHandler(ctx) {
        switch (ctx.callbackQuery.data) {
            case Config.CALLBACKS.GAME_START:
                ctx.reply(`Во что будем играть?`, Extra.markup(Markup.inlineKeyboard([
                    Markup.callbackButton('JAD', Config.CALLBACKS.GAME_JAD),
                    Markup.callbackButton('POKER', Config.CALLBACKS.GAME_POKER)
                ])));
            break;
            case Config.CALLBACKS.GAME_JAD:
                ctx.reply(`Напишите размер ставки и шанс победы (через пробел)`);
                MongoFuncs.dbChangePlayerState(ctx.update.callback_query.from.id, 1);
            break;
        }
        ctx.answerCbQuery(`selected ${ctx.update.callback_query.data}`)
    }

    function textHandler(ctx) {
        MongoFuncs.dbGetPlayerById(ctx.message.from.id).then((res) => {
            switch (res[0].state) {
                case 0:
                    ctx.reply(`Не понял :(`);
                    break;
                case 1:
                    if(/\d+/gm.test(ctx.message.text)) {
                        let result = ctx.message.text.match(/\d+/gm);
                        console.log(result)
                        if (result.length !== 2) {
                            ctx.reply(`Уупс! Что-то забыли указать! Попробуйте ещё раз.`)
                        } else {
                            MongoFuncs.dbUpdatePlayerBet(ctx.message.from.id, {
                                "bet_size": result[0],
                                "bet_chance": result[1]
                            });
                            ctx.reply(`Ставка успешно выполнена!`);
                        }
                    }
                    else ctx.reply(`Что-то вы совсем не так написали. Мб по ебалу? (еще раз)`);
            }
        });
    }

    function onHelp(ctx) {
        ctx.reply(`Расклад такой:\n   /balance - узнать баланс`);
    }

    function onGetList(ctx) {
        MongoFuncs.dbGetAdmins().then((res) => ctx.reply(res));
    }
    
    function checkAdmin(uid) {
        
    }
    
    async function checkUser(uid) {
        let query = await MongoFuncs.dbGetCustom({uid: uid});
        return typeof query !== 'undefined' && query.length > 0
    }

    return {
        onStart,
        onGetList,
        onHelp,
        dumpDB : MongoFuncs.dbDump,
        callbackHandler,
        textHandler
    }
}

module.exports = Core();
