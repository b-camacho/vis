var mg = require('mongoose');
var m = require('./models');
var fs=require('fs');
mg.connect('mongodb://localhost/vis', function (err) {
    if (!err)console.log('DB connected');
    var Journals = {};
    m.Person.find({journalsAmount: {$gt: 0}, department: 'wnh'}, 'journals journalsNoVolumes journalsAmount name', function (err, people) {
        console.log(people);
        // var counter = 0;
        // people.forEach(function (person) {
        //     person.journalsNoVolumes = {};
        //     for (var a in person.journals) {
        //         if(person.journals.hasOwnProperty(a)) {
        //             if(counter%1000 == 0) console.log(counter);
        //             counter++;
        //             if(person.journalsNoVolumes[a.split(',')[0]]) person.journalsNoVolumes[a.split(',')[0]] += person.journals[a];
        //             else person.journalsNoVolumes[a.split(',')[0]] = person.journals[a];
        //             person.markModified('journalsNoVolumes');
        //             person.save();
        //         }
        //         /*if (person.journals[key]) if(person.journals[key].split(',')[0]) Journals[person.journals[key].split(',')[0]] = true;
        //         else console.log('Split on "," of ' + person.journals[key] + ' returned null')*/
        //
        //     }
        // });/*
        // var JournalsArray = [];
        // for (var key in Journals) {
        //     if(Journals.hasOwnProperty(key)) { 
        //         JournalsArray.push({name: key, amount: Journals[key]});
        //     }
        // }
        // JournalsArray.sort(function (a, b) {
        //     if(a.amount < b.amount) return -1;
        //     if(a.amount > b.amount) return 1;
        //     return 0
        // });
        // fs.writeFileSync('alljournals.txt', JSON.stringify(JournalsArray))*/
        /*people.forEach(function (person) {
         var counter = 0;
         for(var key in person.journals) counter++;
         person.journalsAmount = counter;
         person.markModified('journalsAmount');
         person.save(function (err) {
         if(err) console.log(err.message);
         else console.log('Found ' + counter + ' journals')
         });
         })*/
    });

});