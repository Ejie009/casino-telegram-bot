function PokerSession(players, minBet, gameSpeed) {
  function LinkedList() {
    let startHead,
      head = null,
      length = 0;

    function addToHead(value) {
      if (head === null) {
        head = { value };
        startHead = head;
        return head;
      }
      const newNode = { value };
      newNode.next = head;
      head = newNode;
      length++;
      return head;
    }

    function lock() {
      startHead.next = head;
    }

    addToHead();

    function getHead() {
      return head;
    }

    return {
      lock,
      getHead,
      addToHead
    };
  }

  let pConfig = require("./config").user,
    gPlayerList = LinkedList(),
    gTable = [],
    gBank = 0,
    gDealer,
    gCurrent = 0,
    gDeck = {
      cards: require("./deck"),
      shuffle: function shuffle() {
        for (var i = this.cards.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          let temp = this.cards[i];
          this.cards[i] = this.cards[j];
          this.cards[j] = temp;
        }
      },
      pop: function() {
        return this.cards.pop();
      }
    },
    playerWrapper = function(player, balance) {
      return (function PlayerConstructor() {
        let tPlayer = player,
          tCards = [],
          tBalance = balance,
          tMove = true,
          tBet = 0;

        function makeBet(betSize) {
          if (tBalance < betSize || !tMove) return false;
          tBet = betSize;
          tBalance -= betSize;
          gBank += betSize;
          tMove = false;
          return true;
        }

        function addCard(card) {
          tCards.push(card);
        }

        function getUID() {
          return tPlayer;
        }

        function refresh() {
          tBet = 0;
          tCards = [];
          tMove = true;
        }

        return {
          addCard,
          makeBet,
          getUID,
          refresh
        };
      })();
    };
  players.forEach(p =>
    gPlayerList.addToHead(playerWrapper(p[pConfig.uid], p[pConfig.balance]))
  );

  function initGame() {
    gDeck.shuffle();
    for (var j = 0; j < 3; j++) gTable.push(gDeck.pop());
    for (p of gPlayerList) for (j = 0; j < 3; j++) p.addCard(gDeck.pop());
    if (gCurrent === gPlayerList.length) gCurrent = 0;
    gDealer = gPlayerList[gCurrent++];
    if (gCurrent < 2) {
      gPlayerList[gPlayerList.length - 1].makeBet(2 * minBet);
      gPlayerList[gPlayerList.length - 2].makeBet(minBet);
    } else {
      gPlayerList[gCurrent - 1].makeBet(2 * minBet);
      gPlayerList[gCurrent - 2].makeBet(minBet);
    }
  }

  function nextBet(betSize) {
    if (gCurrent !== gPlayerList.length)
      gPlayerList[gCurrent++].makeBet(betSize);
    //else
    //
  }

  function findPlayer(uid) {
    for (var i = 0; i < gPlayerList.length; i++) {
      if (gPlayerList[i].getUID() === uid) return gPlayerList[i];
    }
    return null;
  }

  function newMove() {
    gPlayerList.forEach(p => p.refresh());
  }

  return {
    getBank: function() {
      return gBank;
    },
    initGame,
    findPlayer
  };
} // конечный автомат

let thisSession = new PokerSession(
  [
    { uid: 1, balance: 100 },
    { uid: 2, balance: 100 },
    { uid: 3, balance: 100 },
    { uid: 4, balance: 100 }
  ],
  25,
  1
);

thisSession.initGame();

console.log(thisSession.getBank());
