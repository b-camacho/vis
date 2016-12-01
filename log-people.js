var mg = require('mongoose');
var m = require('./models');
var fs=require('fs');

var people = [
    "Jarosław Porazinski", //wnh
    "Magdalena Niedzielska",
    "Małgorzata Klentak-Zabłocka", //WFL
    "Józef Górniewicz", //WH
    "Jan Adam Malinowski", //WNP
    "Witold Wojdyło", //WPSM
    "Ryszard Michalski",
    "Marian Grabowski",//WT
    "Andrzej Nowicki", //WMI
    "Marian Szymczak" //WFA
];

mg.connect('mongodb://localhost/vis', function (err) {
    if (!err)console.log('DB connected');
    var queryArray = people.map(function (person) {
        return {name: person}
    })
    m.Person.find({$or: queryArray}, function (err, result) {
        console.log(err);
        console.log(result);
        var outString = '';
        result.forEach(function (el) {
            outString += el.name + '\r\n Prace: \r\n';
            for(var key in el.journalsNoVolumes)
                if(el.journalsNoVolumes.hasOwnProperty(key)) outString += key + '\r\n';
            outString += '\r\n';
        });
        fs.writeFileSync('list-of-people-with-journals.txt', outString);
    })
});