const MongoClient = require("mongodb").MongoClient;
const config = require("./config.js");

let userList;

function dbInit() {
  MongoClient.connect(
    config.mongoURL,
    function(err, db) {
      if (err) throw err;
      userList = db.db(config.table_name).collection(config.row_users);
    }
  );
}

function dbDump() {
  userList.drop().then(() => dbInit());
}

function dbInsertPlayer(player) {
  if (!player.hasOwnProperty(config.user.admin))
    player[config.user.admin] = false;
  userList.insertOne(player, function(err, res) {
    if (err) throw err;
  });
}

function dbChangePlayerState(id, newState) {
  userList.updateOne(
    { [config.user.uid]: id },
    { $set: { [config.user.state]: newState } }
  );
}

function dbUpdatePlayerBet(id, newBet) {
  userList.updateOne(
    { [config.user.uid]: id },
    { $set: { [config.user.current_bet]: newBet } }
  );
}

function dbUpdatePlayerBetSize(id, newBetSize) {
  userList.updateOne(
    { [config.user.uid]: id },
    {
      $set: {
        [config.user.current_bet + "." + config.user.bet_size]: newBetSize
      }
    }
  );
}

function dbUpdatePlayerBetChance(id, newBetChance) {
  userList.updateOne(
    { [config.user.uid]: id },
    {
      $set: {
        [config.user.current_bet + "." + config.user.bet_chance]: newBetChance
      }
    }
  );
}

function dbUpdatePlayerBalance(id, newBalance) {
  userList.updateOne(
    { [config.user.uid]: id },
    { $set: { [config.user.balance]: newBalance } }
  );
}

function dbClearPlayerBet(id, newBalance) {
  userList.updateOne(
    { [config.user.uid]: id },
    {
      $set: {
        [config.user.balance]: newBalance,
        [config.user.state]: 0,
        [config.user.current_bet + "." + config.user.bet_chance]: 0,
        [config.user.current_bet + "." + config.user.bet_size]: 0
      }
    }
  );
}

function dbInsertAdmin(player) {
  if (!player.hasOwnProperty(config.user.admin))
    player[config.user.admin] = true;
  return userList.insertOne(player);
}

function dbGetCustom(filter) {
  return userList
    .find(filter, { projection: { [config.user.admin]: 0 } })
    .next();
}

function dbGetUserById(id) {
  return userList.find({ [config.user.uid]: id }).next();
}

async function dbGetUserLanguage(id) {
  return (await userList.find({ [config.user.uid]: id }).next())[
    config.user.language
  ];
}

function dbGetPlayers() {
  return userList
    .find(
      { [config.user.admin]: false },
      { projection: { [config.user.admin]: 0 } }
    )
    .toArray();
}

function dbGetAdmins() {
  return userList
    .find(
      { [config.user.admin]: true },
      { projection: { [config.user.admin]: 0 } }
    )
    .toArray();
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
};
