//DATA FILES
var keyyr = fs.readFileSync("keyy.txt", "utf8")
var file1r = fs.readFileSync("cooldown1.txt", "utf8")
var id_list = fs.readFileSync("id_list.txt", "utf8")
var ttr = fs.readFileSync("ttr.txt", "utf8")
var dates = fs.readFileSync("dates.txt", "utf8")

//GLOBAL VARS
var id_arr = []
var ttr_arr = []
var bal_arr = undefined;
var dates_arr = []
var dates_ = undefined;
var array = ['Влад', 'Богдан', 'Дима', 'Рубан', 'Никита', 'Руслан', 'Даниил']

function loadID() {
    id_arr = id_list.split('\n')
    for (var i = id_arr.length; i >= 0; i--)
        if (id_arr[i] == "" || id_arr[i] == 'undefined' || id_arr[i] == '\r')
            id_arr.remove(i)
    for (var i = 0; i < id_arr.length; i++)
        id_arr[i] = id_arr[i].split('\r').join('')
}

function loadBalance()
{
    ttr_arr = ttr.split('\n')
    for (var i = ttr_arr.length; i >= 0; i--)
        if (ttr_arr[i] == "" || ttr_arr[i] == 'undefined' || ttr_arr[i] == '\r')
            ttr_arr.remove(i)
    for (var i = 0; i < ttr_arr.length; i++)
        ttr_arr[i] = ttr_arr[i].split('\r').join('npm')
    bal_arr = new Dictionary();
    for (var i = 0; i < id_arr.length; i++)
        bal_arr.store(id_arr[i], ttr_arr[i]);
}

function loadColldowns()
{
    dates_arr = dates.split('\n')
    for (var i = dates_arr.length; i >= 0; i--)
        if (dates_arr[i] == "" || dates_arr[i] == 'undefined' || dates_arr[i] == '\r')
            dates_arr.remove(i)
    for (var i = 0; i < dates_arr.length; i++)
        dates_arr[i] = dates_arr[i].split('\r').join('')
    dates_ = new Dictionary();
    for (var i = 0; i < id_arr.length; i++)
        dates_.store(id_arr[i], dates_arr[i]);
    }
}

function saveBalance()
{
    fs.writeFileSync("ttr.txt", "");
    for (var i = 0; i < id_arr.length; i++)
        if (bal_arr.fetch(msg.from.id) == null)
            fs.appendFileSync("ttr.txt", "0\n")
        else fs.appendFileSync("ttr.txt", bal_arr.fetch(id_arr[i]).toString() + '\n');
}

function saveDates()
{
    fs.writeFileSync("dates.txt", "");
    for (var i = 0; i < dates_arr.length; i++) {
        fs.appendFileSync("dates.txt", dates_.fetch(id_arr[i]) + '\n');
    }
}

function saveID()
{
    fs.writeFileSync("id_list.txt", "");
    for (var i = 0; i < id_arr.length; i++) {
        fs.appendFileSync("id_list.txt", id_arr[i] + '\n');
    }
}
