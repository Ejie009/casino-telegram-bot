const TelegramBot = require('node-telegram-bot-api')
const fs = require('fs');
require('dotenv/config')
var tok = process.env.SECRET_TOKEN;
console.log(process.env.SECRET_TOKEN);
const TOKEN =tok

const bot = new TelegramBot(TOKEN, {polling: true})
var array = ['Влад','Богдан','Дима','Рубан','Никита','Руслан','Даниил']
bot.onText(/\/start/, msg => {

const text =`Здарова твgарына ${msg.from.first_name}!\nШо тебе надо?`

bot.sendMessage(msg.chat.id, text, {
    reply_markup:{
        keyboard:[
            ['/daun', '/kazini4']
        ]
      }
    })
})

{
    var Dictionary = function ()
    {
        this.keys = {};
        this.length = 0;
        this.defaultValue = null;
    };

    Dictionary.prototype.store = function(key, value) {
        this.keys[key] = value;
        this.length++;
    };

    Dictionary.prototype.fetch = function(key) {
        var value = this.keys[key];

        if (value) {
            return value;
        } else {
            if (this.defaultValue) return this.defaultValue;
            return null;
        }
    };

    Dictionary.prototype.hasKey = function(key) {
        for (var k in this.keys) {
            if (key == k) {
                return true;
            } else {
                return false;
            }
        };
        return false;
    };

    Dictionary.prototype.remove = function(key) {
        if (this.keys[key]) {
            delete this.keys[key];
            this.length--;
        }
    };

    Dictionary.prototype.reject = function(callback) {
        for (var k in this.keys) {
            if (callback(k, this.keys[k])) {
                delete this.keys[k];
            }
        }
    };

    Dictionary.prototype.random = function() {
        var keys = [];

        for (var k in this.keys) {
            keys.push(k);
        }

        return keys[Math.floor(Math.random() * keys.length)];
    };

    module.exports = Dictionary;
}

{
    var player = function (state_, id_, bet_, chance_)
    {
        this.state = state_;
        this.id = id_;
        this.bet = bet_;
        this.chance = chance_;
    };

    module.exports = player;
}

var players = [];


var keyy=true

var keyyr= fs.readFileSync("keyy.txt", "utf8")
var file1r = fs.readFileSync("cooldown1.txt", "utf8")
var id_list = fs.readFileSync("id_list.txt", "utf8")
var ttr = fs.readFileSync("ttr.txt","utf8")
var dates = fs.readFileSync("dates.txt", "utf8")

Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

var id_arr=id_list.split('\n')
for(var i=id_arr.length; i>=0;i--){
    if(id_arr[i]==""||id_arr[i]=='undefined'||id_arr[i]=='\r'){
        id_arr.remove(i)
    }
}

for(var i=0; i<id_arr.length;i++){
    id_arr[i]=id_arr[i].split('\r').join('')
}

var ttr_arr=ttr.split('\n')

for(var i=ttr_arr.length; i>=0;i--){
    if(ttr_arr[i]==""||ttr_arr[i]=='undefined'||ttr_arr[i]=='\r'){
        ttr_arr.remove(i)
    }
}
for(var i=0; i<ttr_arr.length;i++){
    ttr_arr[i]=ttr_arr[i].split('\r').join('npm')
}

var bal_arr = new Dictionary();
for(var i=0; i<id_arr.length;i++){
    bal_arr.store(id_arr[i],ttr_arr[i]);
}

console.log(bal_arr);
console.log(ttr_arr)

var dates_arr=dates.split('\n')
for(var i=dates_arr.length; i>=0;i--){
    if(dates_arr[i]==""||dates_arr[i]=='undefined'||dates_arr[i]=='\r'){
        dates_arr.remove(i)
    }
}
for(var i=0; i<dates_arr.length;i++){
    dates_arr[i]=dates_arr[i].split('\r').join('')
}

var dates_ = new Dictionary();
for(var i=0; i<id_arr.length;i++){
    dates_.store(id_arr[i],dates_arr[i]);
}

console.log(dates_)

var cooldown = new Date()
if(file1r!='0') cooldown.setTime(file1r)

var cd;

var cooldown2= new Date()
keyy = (keyyr == 'true')

bot.onText(/\/daun/, msg => {
    cooldown2 = new Date();
    cd = (cooldown2.getTime() - cooldown.getTime()) / 60000
    if (cd >= 24 * 60) keyy = true
    if (keyy)
    {
        bot.sendMessage(msg.chat.id,`Даун дня -  ${String(array[Math.floor(Math.random()*7)])}! кулити!`)
        cooldown = new Date(); keyy = false; fs.writeFileSync("keyy.txt", keyy)
    }
    else bot.sendMessage(msg.chat.id,`Перезарядка!! Осталось еще ${String(24*60-cd)} м!`)
})

function random (low, high) {
    return Math.random() * (high - low) + low;
}

bot.onText(/\/play/, msg => {
    for(var i=0; i<players.length; i++){
        if(players[i].id==msg.from.id) return
    }
    bot.sendMessage(msg.chat.id,`${msg.from.first_name}, сколько будете ставить? (в начале ставьте "!")`)
    players.push(new player(false,msg.from.id,0.0,0.0))
})

bot.onText(/\/sabju/, msg => {
    console.log(msg);
    var datenow = new Date().getTime();
    var gt=(datenow-dates_.fetch(msg.from.id))/1000
    if (gt >= 3600)
    {
        bal_arr.store(msg.from.id,(parseFloat(bal_arr.fetch(msg.from.id))+100).toString())
        dates_.store(msg.from.id, datenow);
        bot.sendMessage(msg.chat.id,`+100! Баланс игрока ${msg.from.first_name} теперь составляет - ${bal_arr.fetch(msg.from.id)}!`)
    }
    else bot.sendMessage(msg.chat.id,`До следующего поступления сабжей осталось ${60-(datenow-dates_.fetch(msg.from.id))/60000} минут` )
})

var bal_edit = false;

bot.onText(/\/set_balance/, msg =>{
    if (msg.from.id == 316849379)
    {
        bot.sendMessage(msg.chat.id,"Введите редактируемую сумму в формате id_balance")
       bal_edit=true;
    }
})

bot.onText(/\/balance/, msg => {
    bot.sendMessage(msg.chat.id,`Баланс игрока ${msg.from.first_name} составляет - ${bal_arr.fetch(msg.from.id)}!`)
})

bot.onText(/\/kazini4/, msg => {
    bot.sendMessage(msg.chat.id, 'Добро пожаловать в DDR! ВЕЛКОМ! ваши пожелания...', {
        reply_markup:{
            keyboard:[
                ['/balance','/sabju', '/play']
            ]
        }

    })
    console.log(msg);
})



bot.on('message', msg =>
{
    if(bal_arr.fetch(msg.from.id)==null) {bal_arr.store(msg.from.id,"100")};
    var buff_;
    var allin=false;
    for(var i=0; i<players.length; i++){
        if(players[i].id==msg.from.id) {
            if (!msg.text.startsWith('!')) {
                bot.sendMessage(msg.chat.id, `${msg.from.first_name}, вы неправильно ввели число. Попробуйте еще раз (в начале ставьте "!").`)
                return
            }
            var buff=msg.text.substr(1)
            console.log("uslovie "+!parseFloat(buff).isNaN)
            console.log("xuy "+parseFloat(buff))
            if(!isNaN(parseFloat(buff)))
            {buff_=parseFloat(buff);}
            else
            {
                if (buff == "allin")
                    allin=true
                else
                {
                    bot.sendMessage(msg.chat.id, `${msg.from.first_name}, вы неправильно ввели число. Попробуйте еще раз (в начале ставьте "!").`);
                    players.remove(i);
                    return
                }
            }
            if(buff_<0) buff_=buff_*(-1)
            if (!players[i].state)
            {
                if(allin) {players[i].bet = parseFloat(bal_arr.fetch(msg.from.id))}
                else
                {
                    players[i].bet=buff_;
                }
                console.log("Ставка текущего игрока - "+(players[i].bet))
                console.log("Баланс текущего игрока - "+(bal_arr.fetch(msg.from.id)))
                console.log("Остаток баланса текущего игрока - "+(parseFloat(bal_arr.fetch(msg.from.id))-players[i].bet))
                if (parseFloat(bal_arr.fetch(msg.from.id)) < players[i].bet || players[i].bet == 0)
                {
                    bot.sendMessage(msg.chat.id,"Недостаточно сабжей для ставки. Купить сабжи можно у Владика по курсу 5 грн 1000 сабжей")
                    players.remove(i)
                    return
                }
                else
                    if (parseFloat(bal_arr.fetch(msg.from.id)) == players[i].bet)
                        bal_arr.store(msg.from.id, '0')
                    else bal_arr.store(msg.from.id, (parseFloat(bal_arr.fetch(msg.from.id)) - players[i].bet))
                console.log(bal_arr.fetch(msg.from.id))
                players[i].state=true;
                bot.sendMessage(msg.chat.id,`Пользователь ${msg.from.first_name}, ввёл ставку в сумме ${players[i].bet} сабжей.\nТеперь введите шанс (в начале поставьте "!". Больше 100 не вводить! Сольёте сразу!).`)
                console.log(msg.text);
            }
            else
            {
                players[i].chance=buff_;
                var random_boolean = Math.random() >= 1-players[i].chance/100;
                console.log("Шанс на победу игрока - "+players[i].chance)
                console.log(typeof(players[i].chance))
                if (random_boolean)
                {
                    bal_arr.store(msg.from.id, (parseFloat(bal_arr.fetch(msg.from.id))+players[i].bet*100/players[i].chance).toString());
                    var textwin="";
                    if(players[i].chance<=5){textwin=textwin+"\u{1F4B8}\u{1F4B8}\u{1F4B8}MEGA SUPER BIG WIN\u{1F4B8}\u{1F4B8}\u{1F4B8}\n";}
                    else {
                    if(players[i].chance<=10){textwin=textwin+"\u{1F4B8}\u{1F4B8}SUPER BIG WIN\u{1F4B8}\u{1F4B8}\n";}
                    else {
                    if(players[i].chance<=25){textwin=textwin+"\u{1F4B8}BIG WIN\u{1F4B8}\n";}}}
                    textwin=textwin+`\u{2705}\u{2705}\u{2705}Пользователь ${msg.from.first_name}, выиграл сумму в размере ${players[i].bet * 100 / players[i].chance} сабжей.\nТеперь его баланс составляет -${bal_arr.fetch(msg.from.id)}! Красава!`
                    bot.sendMessage(msg.chat.id,textwin)
                }
                else bot.sendMessage(msg.chat.id,`\u{274C}\u{274C}\u{274C}Пользователь ${msg.from.first_name}, проиграл ставку в размере ${players[i].bet} сабжей.\nТеперь его баланс составляет - ${bal_arr.fetch(msg.from.id)}! roflanpominki!`)
                players.remove(i);
            }
            fs.writeFileSync("ttr.txt","");
            for (var i = 0; i < id_arr.length; i++)
                if (bal_arr.fetch(msg.from.id) == null)
                    fs.appendFileSync("ttr.txt", "0\n")
                else fs.appendFileSync("ttr.txt",bal_arr.fetch(id_arr[i]).toString()+'\n');
            return
        }
    }

    if(bal_edit){
        var setbal=msg.text;
        var balid=setbal.substr(0,9);
        for(var i = 0; i<id_arr.length; i++) {
            if (balid==id_arr[i]){
                setbal=setbal.substr(10);
                bal_arr.store(balid,setbal)
                bot.sendMessage(msg.chat.id,"Готово!")
                bal_edit=false
                return
            }
        }
    }
    console.log(msg)

    switch(msg.text){
        case 'подрубалити':
            bot.sendMessage(msg.chat.id,'из реалити')
            break
        case 'инспектор':
            bot.sendMessage(msg.chat.id,'солярис')
            break
        case 'изи':
            bot.sendMessage(msg.chat.id,'для папизи')
            break
        case 'roflan': {
            console.log(msg);
            var random_number = random(1,4)
            switch(Math.round(random_number)) {
                case 1: bot.sendMessage(msg.chat.id, 'spy')
                    break
                case 2:bot.sendMessage(msg.chat.id,'ebalo')
                    break
                case 3:bot.sendMessage(msg.chat.id,'pominki')
                    break
                case 4:bot.sendMessage(msg.chat.id,'tigran')
                    break
            }
        }
            break
        case 'kd1':
            bot.sendMessage(msg.chat.id,cooldown)
            break
        case 'kd2':
            bot.sendMessage(msg.chat.id,cooldown2)
            break
        case 'kd3':
            bot.sendMessage(msg.chat.id,cooldown2.getTime()-cooldown.getTime())
            break
        case 'kd4':
            bot.sendMessage(msg.chat.id,keyyr)
            break
    }

    var isExists = false
    for(var i=0;i<id_arr.length;i++){
        if(id_arr[i]==msg.from.id.toString()){
            isExists=true
            break
        }
    }

    if(!isExists){
        id_arr.push(msg.from.id.toString());
        fs.writeFileSync("id_list.txt","");
        for(var i =0;i<id_arr.length;i++){
            fs.appendFileSync("id_list.txt",id_arr[i]+'\n');
        }
    }

    fs.writeFileSync("dates.txt","");
    for(var i =0;i<dates_arr.length;i++){
        fs.appendFileSync("dates.txt",dates_.fetch(id_arr[i])+'\n');
    }

    fs.writeFileSync("ttr.txt","");
    for(var i =0;i<id_arr.length;i++){
        if(bal_arr.fetch(msg.from.id)==null) {fs.appendFileSync("ttr.txt","0\n")}
        else { 
            fs.appendFileSync("ttr.txt",bal_arr.fetch(id_arr[i]).toString()+'\n');
            fs.writeFileSync("cooldown1.txt", cooldown.getTime());
        }
    }
})
