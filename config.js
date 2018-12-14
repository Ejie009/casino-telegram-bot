module.exports = Object.freeze({
  callbacks: {
    game_start: "game_start",
    game_end: "game_end",
    game_jad: "game_jad",
    game_poker: "game_poker",
    game_balance: "game_balance"
  },
  table_name: "casino-db",
  row_users : "users",
  user: {
    uid: "uid",
    name: "name",
    admin: "admin",
    balance: "balance",
    bets: "bets",
    current_bet: "current_bet",
    bet_size: "bet_size",
    bet_chance: "bet_chance",
    language : "ru"
  },
  game: {
    jad: "JAD",
    poker: "POKER"
  },
  languages: {
    ru: "ru",
    en: "en"
  },
  states: {
      STATE_EMPTY: 0,
      STATE_JAD_BET_CHOICE: 1,
      STATE_JAD_BET_SIZE: 2
  },
  routes: {
    start: "/\/start/",
    get: "/\/get/",
    dbdrop : "/\/db_drop",
    help: "/\/help/",
    set: "/\/set*/",
    balance: "/\/balance/"
  }
})