const MongoClient = require('mongodb').MongoClient;
const MongoUrl = "mongodb://localhost:27017/";
const table = "casino-db";
const row = "users";
const column = require('./config.js').user;

let userList;

function dbInit() {
    MongoClient.connect(MongoUrl, function (err, db) {
        if (err) {
            throw err;
        }
        userList = db.db(table).collection(row);
    });
}

function dbDump() {
    userList.drop().then(() => dbInit());
}

function dbInsertPlayer(player) {
    if(!player.hasOwnProperty("admin")) player[column.admin] = false;
    userList.insertOne(player, function(err, res) {
        if (err) throw err;
        console.log("1 player inserted");
    });
}

function dbChangePlayerState(id, newState) {
    userList.updateOne({[column.uid]: id}, {$set: { [column.state]: newState }});
}

function dbUpdatePlayerBet(id, newBet) {
    userList.updateOne({[column.uid]: id}, {$set: { [column.current_bet]: newBet }});
}

function dbUpdatePlayerBetSize(id, newBetSize) {
    userList.updateOne({[column.uid]: id}, {$set: { [column.current_bet + '.' + column.bet_size]: newBetSize }});
}

function dbUpdatePlayerBetChance(id, newBetChance) {
    userList.updateOne({[column.uid]: id}, {$set: { [column.current_bet + '.' + column.bet_chance]: newBetChance }});
}

function dbUpdatePlayerBalance(id, newBalance) {
    userList.updateOne({[column.uid]: id}, {$set: { [column.balance]: newBalance }})
}

function dbClearPlayerBet(id, newBalance) {
    userList.updateOne({[column.uid]: id}, {$set: {
            [column.balance]: newBalance,
            [column.state]: 0,
            [column.current_bet + '.' + column.bet_chance]: 0,
            [column.current_bet + '.' + column.bet_size]: 0
    }})
}

function dbInsertAdmin(player) {
    if(!player.hasOwnProperty(column.admin)) player[column.admin] = true;
    return userList.insertOne(player);
}

function dbGetCustom(filter) {
    return userList.find(filter, { projection: { [column.admin]: 0 } }).next();
}

function dbGetUserById(id) {
    return userList.find({ [column.uid]: id}).next();
}

function dbGetUserLanguage(id) {
    return userList.find({ [column.uid]: id}).next()[column.language];
}

function dbGetPlayers() {
    return userList.find({ [column.admin]: false }, { projection: { [column.admin]: 0 } }).toArray();
}

function dbGetAdmins() {
    return userList.find({ [column.admin]: true }, { projection: { [column.admin]: 0 } }).toArray();
}

function dbGetUsers() {
    return userList.find().toArray();
}

module.exports = {
    dbGetUserLanguage,
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
}
