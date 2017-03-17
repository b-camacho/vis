/**
 * Created by nopony on 05.03.17.
 */
const fs = require('fs');
const mg  = require('mongoose');
const models = require('./models');
const removeDiacritics = require('./remove-diacritics')
const stdio = require('stdio');


function TestMergeable (name1, name2) {
    let LetterList = Array.from(name1.split(''));
    let score = 0;
    name2.split('').forEach((letter) => {
        let index = LetterList.indexOf(letter);
        (index == -1) ? score-- : LetterList.splice(0, 1);
    });
    score -= LetterList.length;
    //score /= ( (person2.length + person1.length) / 2 );

    return score;
}

function MergePeople(person1, person2) {
    let AllWorksSet = new Set();
    person1.works.forEach((work)=>{AllWorksSet.add(work)});
    person2.works.forEach((work)=>{AllWorksSet.add(work)});

    let allWorksArray = Array.from(AllWorksSet);
    person1.works = allWorksArray;
    person2.works = allWorksArray;

    person1.cloneOf = person2._id.toString();
    person2.cloneOf = person1._id.toString();

    person1.save((err) => {
        err ? console.log(err) : console.log('saved obj ' + person1.name)
    });
    person2.save((err) => {
        err ? console.log(err) : console.log('saved obj ' + person1.name)
    })
}

let potentialDuplicates = [];

mg.connect('mongodb://127.0.0.1/vis', (err) => {
    err ? console.log(err) : console.log('connected');

    models.Person.find({}, '_id name works cloneOf',(err, allPeople) => {
        allPeople.forEach((person) => {person.stdName = removeDiacritics(person.name.trim().toLowerCase())});

        allPeople.forEach((person, index) => {
            if(person.name.indexOf('v') != -1)
            allPeople.forEach((otherPerson) => {
                // if(otherPerson.name.indexOf('ł') != -1|| otherPerson.name.indexOf('ó') != -1 || otherPerson.name.indexOf('ń') != -1 || otherPerson.name.indexOf('ś')!= -1
                //     || otherPerson.name.indexOf('ą') != -1 || otherPerson.name.indexOf('ę')!= -1 || otherPerson.name.indexOf('k')!= -1)
                if(person._id.toString() != otherPerson._id.toString()) {
                    if(TestMergeable(person.stdName, otherPerson.stdName) > -2)
                        potentialDuplicates.push({q: person.stdName + '==' + otherPerson.stdName + '? \n', p1: person, p2: otherPerson})
                }
            });
            console.log(index+'/'+allPeople.length)
        });

        let i = 0;
        let recursive = function(it){
            stdio.question(potentialDuplicates[i].q, ['y', 'n'], (err, result) => {
                i++;
                MergePeople(potentialDuplicates[it].p1, potentialDuplicates[it].p2);
                if(i<potentialDuplicates.length - 1) recursive(i);
            })
        };
        recursive(i)
    })


})



/*
[   {a: 'Vieslava', b: 'Wiesława'},
    {a: 'Veslava', b: 'Agata'},
    {a: 'Kamila', b: 'Kamil'}
    ].forEach((pair) => {
    console.log(pair + ' scored: '+ TestMergeable(pair.a, pair.b))
})*/
