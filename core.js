async function Core() {

    const mongoFuncs = require('./dbfuncs');
    const config = require("./config.js");
    const keyboards = require('./keyboards');
    const locale = require('./locale');

    await mongoFuncs.dbInit();

    async function onStart(ctx) {
        let exists = await userExist(ctx.message.from.id);
        let lang = await mongoFuncs.dbGetUserLanguage(ctx.message.from.id);
        if (exists) ctx.reply(locale.helloBro(ctx.message.from.id), keyboards.hello);
        else {
            ctx.reply(locale.helloWho, keyboards.hello(lang));
            mongoFuncs.dbInsertPlayer(userWrapper(ctx.message.from.id, ctx.message.from.first_name, 500, 0, 0, 0));
        }
    }

    function userWrapper(uid, name, balance, state, bet_chance, bet_size) {
        return {
            [config.user.uid]: uid,
            [config.user.name]: name,
            [config.user.balance]: balance,
            [config.user.state]: state,
            [config.user.current_bet]: {
                [config.user.bet_chance]: bet_chance,
                [config.user.bet_size]: bet_size
            },
            [config.user.language]: config.languages.ru
        }
    }

    async function callbackHandler(ctx) {
        let lang = await mongoFuncs.dbGetUserLanguage(ctx.update.callback_query.from.id)
        switch (ctx.update.callback_query.data) {
            case config.callbacks.game_start:
                ctx.reply(locale.callbacks.letsPlay[lang], keyboards.play);
            break;
            case config.callbacks.game_jad:
                let player = await mongoFuncs.dbGetUserById(ctx.update.callback_query.from.id)
                if(player.balance === 0) {
                    ctx.reply(locale.callbacks.fuckYou[lang]);
                } else {
                    ctx.reply(locale.bets.tellBetChance[lang], keyboards.jad.bet_chance);
                    mongoFuncs.dbChangePlayerState(ctx.update.callback_query.from.id, config.states.STATE_JAD_BET_SIZE);
                }
            break;
            case config.callbacks.game_poker:
                ctx.reply(locale.pokerDevelop[lang]);
            break;
            case config.callbacks.game_balance:
                ctx.reply(await onBalance(ctx.update.callback_query.from.id));
        }
    }

    async function textHandler(ctx) {
        let user = await mongoFuncs.dbGetUserById(ctx.message.from.id), lang = user[config.user.language];
        let result;
        switch (user.bets) {
            case config.states.STATE_EMPTY:
                ctx.reply(locale.bets.dontUnderstand[lang]);
                break;
            case config.states.STATE_JAD_BET_CHOICE:
                result = ctx.message.text.match(/\d+/);
                if (!/\d+(\.\d+)?/gm.test(ctx.message.text) || result.length !== 1) {
                    ctx.reply(locale.errors.dontUnderstand[lang]);
                    return;
                }
                if ((result[0] <= 0 || result[0] >= 100)) {
                    ctx.reply(locale.errors.wrongNumber[lang]);
                    return;
                }
                mongoFuncs.dbUpdatePlayerBetChance(ctx.message.from.id, parseFloat(result[0]));
                mongoFuncs.dbChangePlayerState(ctx.message.from.id, config.states.STATE_JAD_BET_SIZE);
                ctx.reply(locale.bets.tellBetSize[lang], keyboards.jad.bet_size(
                    await mongoFuncs.dbGetUserById(ctx.message.from.id)[config.user.balance]));
                break;
            case config.states.STATE_JAD_BET_SIZE:
                if (!/\d+(\.\d+)?/gm.test(ctx.message.text)) {
                    ctx.reply(locale.errors.dontUnderstand[lang]);
                    return;
                }
                result = ctx.message.text.match(/\d+/);
                if (result.length !== 1) {
                    ctx.reply(locale.errors.dontUnderstand[lang]);
                    return;
                }
                const betSize = parseFloat(result[0]);
                mongoFuncs.dbUpdatePlayerBetSize(ctx.message.from.id, betSize);
                let newUser = await mongoFuncs.dbGetUserById(ctx.message.from.id)
                if (betSize <= 0) {
                    ctx.reply(locale.errors.wrongBet[lang]);
                    return;
                }
                if (betSize > newUser[config.user.balance]) {
                    ctx.reply(locale.errors.wrongNumber[lang]);
                    return;
                }
                mongoFuncs.dbUpdatePlayerBalance(ctx.message.from.id,
                    parseFloat((newUser[config.user.balance] - betSize).toFixed(3)));
                let win = processBet(newUser[config.user.current_bet]);
                await ctx.reply(locale.bets.calculatingBet[lang])
                if (win === 0) {
                    ctx.reply(locale.bets.tellLose[lang], keyboards.play);
                    return;
                }
                locale.bets.tellCongratulations(win, newUser[config.user.current_bet][config.user.bet_chance]);
                mongoFuncs.dbChangePlayerState(ctx.message.from.id, config.states.STATE_EMPTY);
                break;
        }
    }

    function processBet(bet) {
        return (Math.random() * 100 < bet[config.user.bet_chance])
            ? bet[config.user.bet_size] * 100/bet[config.user.bet_chance] : 0;
    }

    async function onHelp(ctx) {
        ctx.reply(locale.help[await mongoFuncs.dbGetUserLanguage(ctx.message.from.id)]);
    }

    async function onGetList(ctx) {
        ctx.reply(await mongoFuncs.dbGetPlayers());
    }
    
    async function checkAdmin(uid) {
        let query = await mongoFuncs.dbGetUserById(uid);
        return !!query;
    }
    
    async function userExist(uid) {
        let query = await mongoFuncs.dbGetUserById(uid);
        return !!query;
    }

    async function onBalance(uid) {
        return locale.balance(await mongoFuncs.dbGetUserById(uid)[config.user.balance]);
    }

    async function onSetBalance(ctx) {
        let res = ctx.message.text.match(/\w+/gm);
        console.log(res)
        if(res.length !== 3)
            ctx.reply(locale.errors.dontUnderstand[await mongoFuncs.dbGetUserLanguage(ctx.message.from.id)]);
        else
            mongoFuncs.dbUpdatePlayerBalance(parseInt(res[1]), parseFloat(res[2]));
    }

    return {
        onSetBalance,
        onBalance,
        onStart,
        onGetList,
        onHelp,
        dumpDB : mongoFuncs.dbDump,
        callbackHandler,
        textHandler
    }
}

module.exports = Core();
