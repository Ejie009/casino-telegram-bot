let lang = require('./config').languages

module.exports = {
  start: {
    [lang.ru]:
      'Привет. Помощь - /help.\nУдачи!'
  },
  help: {
    [lang.ru]: 'Расклад такой:\n   /balance - узнать баланс'
  },
  balance: {
    [lang.ru]: balance => `Ваш баланс - ${balance} сабжей`
  },
  callbacks: {
    startGame: {
      [lang.ru]: 'Начать игру'
    },
    getBalance: {
      [lang.ru]: 'Узнать баланс'
    },
    letsPlay: {
      [lang.ru]: 'Во что будем играть?'
    },
    tooPoor: {
      [lang.ru]:
        'Как будут деньги - приходи, а пока попрошу где-то накопить сабжей'
    }
  },
  state: {
    tellBetChance: {
      [lang.ru]: 'Напишите шанс победы'
    },
    tellBetSize: {
      [lang.ru]: 'Теперь напишите размер ставки'
    },
    calculatingBet: {
      [lang.ru]: 'Считаем вашу ставку...'
    },
    tellLose: {
      [lang.ru]: 'К сожалению вы проиграли(\nСыграем еше?'
    },
    tellCongratulations: (win, chance) => {
      if (chance <= 5)
        return {
          [lang.ru]: `💸💸💸MEGA SUPER BIG WIN💸💸💸\nВау! Вы выиграли: ${win} сабжей! РЕРЕЙЗ!`
        }
      if (chance <= 10)
        return {
          [lang.ru]: `💸💸SUPER BIG WIN💸💸\nВау! Вы выиграли: ${win} сабжей! РЕРЕЙЗ!`
        }
      if (chance <= 25)
        return {
          [lang.ru]: `💸BIG WIN💸\nВау! Вы выиграли: ${win} сабжей! РЕРЕЙЗ!`
        }
      return `Вау! Вы выиграли: ${win} сабжей! РЕРЕЙЗ!`
    }
  },
  pokerDevelop: {
    [lang.ru]: 'В разработке.'
  },
  errors: {
    unknownUser: {
      [lang.ru]: 'Вы не были найдены в базе данных бота. Напишите /start'
    },
    dontUnderstand: {
      [lang.ru]: [
        'Не понял :(',
        'Что-то вы совсем не так написали.',
        'Уупс! Что-то не понял(! Попробуйте ещё раз.'
      ][Math.floor(Math.random() * 3)]
    },
    wrongNumber: {
      [lang.ru]: 'Введите число в пределах 1 - 99!'
    },
    wrongBet: {
      [lang.ru]: 'Неправильная ставка'
    },
    noMoney: {
      [lang.ru]: 'Недостаточно сабжей :('
    }
  }
}
