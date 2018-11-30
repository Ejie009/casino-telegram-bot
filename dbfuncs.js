function MongoFuncs() {

    let MongoClient = require('mongodb').MongoClient;
    let MongoUrl = "mongodb://localhost:27017/";
    let TABLE_NAME = "casino-db";
    let ROW_PLAYERS = "players";

    let userList;

    async function dbInit() {
        await MongoClient.connect(MongoUrl, function (err, db) {
            if (err) {
                throw err;
            }
            userList = db.db(TABLE_NAME).collection(ROW_PLAYERS);
        })
        return true;
    }

    function dbDump() {
        userList.drop();
        dbInit();
    }

    async function dbInsertPlayer(player) {
        if(!player.hasOwnProperty("admin")) player.admin = false;
        await userList.insertOne(player, function(err, res) {
            if (err) throw err;
            console.log("1 player inserted");
        });
        return true;
    }

    async function dbChangePlayerState(id, newState) {
        await userList.updateOne({uid : id}, {$set:{ state : newState}});
        return true;
    }

    async function dbUpdatePlayerBet(id, newBet) {
        await userList.updateOne({uid : id}, {$set: { currentBet : newBet }});
    }

    async function dbInsertAdmin(player) {
        if(!player.hasOwnProperty("admin")) player.admin = true;
            await userList.insertOne(player, function(err, res) {
                if (err) throw err;
                console.log("1 player inserted");
        });
        return true;
    }

    async function dbGetCustom(filter) {
        return await userList.find(filter, { projection: { admin: 0 } }).toArray();
    }

    async function dbGetPlayerById(id) {
        return await userList.find({ uid: id}).toArray();
    }

    async function dbGetPlayers() {
        return await userList.find({ admin: false }, { projection: { admin: 0 } }).toArray();
    }

    async function dbGetAdmins() {
        return await userList.find({ admin: true }, { projection: { admin: 0 } }).toArray();
    }

    async function dbGetUsers() {
        return await userList.find().toArray();
    }

    return {
        dbUpdatePlayerBet,
        dbGetPlayerById,
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
