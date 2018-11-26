function Core() {
    const MongoFuncs = require("./dbfuncs");

    const Extra = require('telegraf/extra')
    const Markup = require('telegraf/markup')

    const keyboard = Markup.inlineKeyboard([
        Markup.urlButton('❤️', 'http://telegraf.js.org'),
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
                    "uid" : ctx.message.from.id,
                    "name" : ctx.message.from.first_name,
                    "balance" : 500
                });
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
        dumpDB : MongoFuncs.dbDump
    }
}

module.exports = Core();
