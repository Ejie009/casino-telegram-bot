function MongoFuncs() {

    const MongoClient = require('mongodb').MongoClient;
    const MongoUrl = "mongodb://localhost:27017/";
    const TABLE_NAME = "casino-db";
    const ROW_USERS = "users";
    const COLOUMN = require('./config.json').USER;

    let userList;

    async function dbInit() {
        await MongoClient.connect(MongoUrl, function (err, db) {
            if (err) {
                throw err;
            }
            userList = db.db(TABLE_NAME).collection(ROW_USERS);
        });
        return true;
    }

    function dbDump() {
        userList.drop().then(() => dbInit());
    }

    async function dbInsertPlayer(player) {
        if(!player.hasOwnProperty("admin")) player[COLOUMN.ADMIN] = false;
        await userList.insertOne(player, function(err, res) {
            if (err) throw err;
            console.log("1 player inserted");
        });
        return true;
    }

    async function dbChangePlayerState(id, newState) {
        await userList.updateOne({[COLOUMN.UID]: id}, {$set: { [COLOUMN.STATE]: newState }});
        return true;
    }

    async function dbUpdatePlayerBet(id, newBet) {
        await userList.updateOne({[COLOUMN.UID]: id}, {$set: { [COLOUMN.CURRENT_BET]: newBet }});
    }

    async function dbUpdatePlayerBetSize(id, newBetSize) {
        await userList.updateOne({[COLOUMN.UID]: id}, {$set: { [COLOUMN.CURRENT_BET + '.' + COLOUMN.BET_SIZE]: newBetSize }});
    }

    async function dbUpdatePlayerBetChance(id, newBetChance) {
        await userList.updateOne({[COLOUMN.UID]: id}, {$set: { [COLOUMN.CURRENT_BET + '.' + COLOUMN.BET_CHANCE]: newBetChance }});
    }

    async function dbUpdatePlayerBalance(id, newBalance) {
        await userList.updateOne({[COLOUMN.UID]: id}, {$set: { [COLOUMN.BALANCE]: newBalance }})
    }

    async function dbClearPlayerBet(id, newBalance) {
        await userList.updateOne({[COLOUMN.UID]: id}, {$set: {
                [COLOUMN.BALANCE]: newBalance,
                [COLOUMN.STATE]: 0,
                [COLOUMN.CURRENT_BET + '.' + COLOUMN.BET_CHANCE]: 0,
                [COLOUMN.CURRENT_BET + '.' + COLOUMN.BET_SIZE]: 0
        }})
    }

    async function dbInsertAdmin(player) {
        if(!player.hasOwnProperty(COLOUMN.ADMIN)) player[COLOUMN.ADMIN] = true;
            await userList.insertOne(player, function(err, res) {
                if (err) throw err;
                console.log("1 admin inserted");
        });
        return true;
    }

    async function  dbGetCustom(filter) {
        return await userList.find(filter, { projection: { [COLOUMN.ADMIN]: 0 } }).next();
    }

    async function dbGetUserById(id) {
        return await userList.find({ [COLOUMN.UID]: id}).next();
    }

    async function dbGetPlayers() {
        return await userList.find({ [COLOUMN.ADMIN]: false }, { projection: { [COLOUMN.ADMIN]: 0 } }).toArray();
    }

    async function dbGetAdmins() {
        return await userList.find({ [COLOUMN.ADMIN]: true }, { projection: { [COLOUMN.ADMIN]: 0 } }).toArray();
    }

    async function dbGetUsers() {
        return await userList.find().toArray();
    }

    return {
        dbClearPlayerBet,
        dbUpdatePlayerBalance,
        dbUpdatePlayerBetSize,
        dbUpdatePlayerBetChance,
        dbUpdatePlayerBet,
        dbGetUserById,
        dbChangePlayerState,
        dbGetCustom,
        dbGetAdmins,
        dbGetPlayers,
        dbGetUsers,
        dbInsertAdmin,
        dbInsertPlayer,
        dbInit,
        dbDump
    };
}
module.exports = MongoFuncs();
