function Core() {

    const MongoFuncs = require("./dbfuncs");
    const Config = require("./config.json")
    const Extra = require('telegraf/extra')
    const Markup = require('telegraf/markup')

    const MarkUpKeyboards = {
        HELLO: Markup.inlineKeyboard([
            Markup.callbackButton('Начать игру', Config.CALLBACKS.GAME_START),
            Markup.callbackButton('Узнать баланс', Config.CALLBACKS.GAME_BALANCE)]).extra(),
        PLAY: Markup.inlineKeyboard([
            Markup.callbackButton('JAD', Config.CALLBACKS.GAME_JAD),
            Markup.callbackButton('POKER', Config.CALLBACKS.GAME_POKER)
        ]).extra()
    }
    MongoFuncs.dbInit().then(console.log);

    function onStart(ctx) {
        userExist(ctx.message.from.id).then((exists) => {
            console.log(exists);
            if(exists) ctx.reply(`Здарова бро-${ctx.message.from.first_name}!\nШо тебе надо?`, MarkUpKeyboards.HELLO);
            else {
                ctx.reply(`Дароу, ты первый раз в этом боте?\nТогда рекомендую почитать /help дабы понять как играть.\nУдачи!`, MarkUpKeyboards.HELLO);
                MongoFuncs.dbInsertPlayer({
                    [Config.USER.UID]: ctx.message.from.id,
                    [Config.USER.NAME]: ctx.message.from.first_name,
                    [Config.USER.BALANCE]: 500,
                    [Config.USER.STATE]: 0,
                    [Config.USER.CURRENT_BET]: {
                        [Config.USER.BET_CHANCE]: 0,
                        [Config.USER.BET_SIZE]: 0
                    }
                });
            }
        });
    }

    function callbackHandler(ctx) {
        switch (ctx.update.callback_query.data) {
            case Config.CALLBACKS.GAME_START:
                ctx.reply(`Во что будем играть?`, MarkUpKeyboards.PLAY);
            break;
            case Config.CALLBACKS.GAME_JAD:
                MongoFuncs.dbGetUserById(ctx.update.callback_query.from.id).then((player) => {
                    if(player.balance === 0) {
                        ctx.reply(`Как будут деньги - приходи, а пока иди нахуй чмо`);
                    } else {
                        ctx.reply(`Напишите шанс победы`, Markup.keyboard([['50'], ['25', '10', '5']]).oneTime().resize().extra());
                        MongoFuncs.dbChangePlayerState(ctx.update.callback_query.from.id, 1);
                    }
                })
            break;
            case Config.CALLBACKS.GAME_POKER:
                ctx.reply(`В разработке. идите нахуй пока что (ну или пососите мне чл3н)) )`);
            break;
            case Config.CALLBACKS.GAME_BALANCE:
                onBalance(ctx);
        }
        ctx.answerCbQuery(`selected ${ctx.update.callback_query.data}`)
    }

    function textHandler(ctx) {
        MongoFuncs.dbGetUserById(ctx.message.from.id).then((res) => {
            console.log(res);
            switch (res.state) {
                case 0:
                     ctx.reply(`Не понял :(`);
                    break;
                case 1:
                    if(/\d+(\.\d+)?/gm.test(ctx.message.text)) {
                        let result = ctx.message.text.match(/\d+/);
                        if (result.length !== 1) {
                            ctx.reply(`Уупс! Что-то не понял(! Попробуйте ещё раз.`)
                        } else {
                            if(result[0] > 0 && result[0] < 100)
                            {
                                MongoFuncs.dbUpdatePlayerBetChance(ctx.message.from.id, parseFloat(result[0]))
                                    .then(()=> MongoFuncs.dbChangePlayerState(ctx.message.from.id, 2));
                                MongoFuncs.dbGetUserById(ctx.message.from.id).then((player)=>ctx.reply(`Теперь напишите размер ставки`,
                                    Markup.keyboard([[player.balance.toString()], [(player.balance/2).toString(),
                                        (player.balance/4).toString()], [(player.balance/10).toString()]]).oneTime().resize().extra()));

                            } else {
                                ctx.reply(`Введите число в пределах 1 - 99!`)
                            }
                        }
                    }
                    else ctx.reply(`Что-то вы совсем не так написали. Мб по ебалу? (еще раз)`);
                    break;
                case 2:
                    if(/\d+(\.\d+)?/gm.test(ctx.message.text)) {
                        let result = ctx.message.text.match(/\d+/);
                        if (result.length !== 1) {
                            ctx.reply(`Уупс! Что-то не понял(! Попробуйте ещё раз.`)
                        } else {
                            const betSize = parseFloat(result[0]);
                            MongoFuncs.dbUpdatePlayerBetSize(ctx.message.from.id, betSize)
                                .then(()=> {
                                    MongoFuncs.dbGetUserById(ctx.message.from.id)
                                        .then((player) => {
                                            console.log(betSize);
                                            if(betSize <= 0) {
                                                ctx.reply("Ты шо ебобо? Иди-ка ты нахуй с такими ставками");
                                                return;
                                            }
                                            if(betSize > player[Config.USER.BALANCE]) {
                                                ctx.reply("Недостаточно сабжей :(");
                                                return;
                                            }
                                        MongoFuncs.dbUpdatePlayerBalance(ctx.message.from.id,
                                            parseFloat((player[Config.USER.BALANCE] - betSize).toFixed(3))
                                        ).then(() => {
                                            ctx.reply(`Считаем вашу ставку...`)
                                                .then(() => {
                                                    let win = processBet(player[Config.USER.CURRENT_BET]);
                                                    let finishCB = function () {
                                                        ctx.reply(`Вау! Вы выиграли: ${win} сабжей! РЕРЕЙЗ!`, MarkUpKeyboards.PLAY);
                                                        MongoFuncs.dbClearPlayerBet(ctx.message.from.id, player[Config.USER.BALANCE] + win);
                                                    }
                                                    if(win === 0) ctx.reply(`К сожалению вы проиграли(\nСыграем еше?`, MarkUpKeyboards.PLAY);
                                                    else if(player[Config.USER.CURRENT_BET][Config.USER.BET_CHANCE] <= 5)
                                                            ctx.reply("💸💸💸MEGA SUPER BIG WIN💸💸💸\n").then(finishCB);
                                                        else if(player[Config.USER.CURRENT_BET][Config.USER.BET_CHANCE] <= 10)
                                                                ctx.reply("💸💸SUPER BIG WIN💸💸\n").then(finishCB);
                                                            else if(player[Config.USER.CURRENT_BET][Config.USER.BET_CHANCE] <= 25)
                                                                    ctx.reply("💸BIG WIN💸\n").then(finishCB);
                                                            else ctx.reply("💸WIN💸\n").then(finishCB);
                                                }
                                            );
                                        })
                                    })
                                });
                        }
                    }
                    else ctx.reply(`Что-то вы совсем не так написали. Мб по ебалу? (еще раз)`);
                    MongoFuncs.dbChangePlayerState(ctx.message.from.id, 0)

            }
        });
    }

    function processBet(bet) {
        return (Math.random() * 100 < bet[Config.USER.BET_CHANCE])
            ? bet[Config.USER.BET_SIZE] * 100/bet[Config.USER.BET_CHANCE] : 0;
    }

    function onHelp(ctx) {
        ctx.reply(`Расклад такой:\n   /balance - узнать баланс`);
    }

    function onGetList(ctx) {
        MongoFuncs.dbGetPlayers().then((res) => ctx.reply(res));
    }
    
    async function checkAdmin(uid) {
        let query = await MongoFuncs.dbGetUserById(uid);
        return query !== null ? query[Config.USER.ADMIN] : false;
    }
    
    async function userExist(uid) {
        let query = await MongoFuncs.dbGetUserById(uid);
        return query !== null;
    }

    async function onBalance(ctx) {
        return await (ctx.message !== undefined) ?
            MongoFuncs.dbGetUserById(ctx.message.from.id).then((res) => ctx.reply(`Ваш баланс - ${res[Config.USER.BALANCE]} сабжей`)) :
            MongoFuncs.dbGetUserById(ctx.update.callback_query.from.id).then((res) => ctx.reply(`Ваш баланс - ${res[Config.USER.BALANCE]} сабжей`));
    }

    async function onSetBalance(ctx) {
        let res = ctx.message.text.match(/\w+/gm);
        console.log(res)
        if(res.length !== 3) ctx.reply(`додик`);
        else MongoFuncs.dbUpdatePlayerBalance(parseInt(res[1]), parseFloat(res[2]));
    }

    return {
        onSetBalance,
        onBalance,
        onStart,
        onGetList,
        onHelp,
        dumpDB : MongoFuncs.dbDump,
        callbackHandler,
        textHandler
    }
}

module.exports = Core();
