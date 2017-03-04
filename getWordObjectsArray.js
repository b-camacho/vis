/**
 * Created by nopony on 04.03.17.
 */

const illegalChars = [',', '.', ';', ':', '!', '?', '<', '>', '[', ']', '(', ')', '/',"'", '"'];

function getFilteredWordAmountsArray(wordsToFilterFrom) {
    console.log(wordsToFilterFrom.length)
    const fs = require('fs');
    const rawArray = fs.readFileSync('stop-words-polish.txt').toString().split('\n');

    let StopWordSet = new Set();

    StopWordSet.forEach(function (word) {
        if(word == '') return;
        if(word[word.length - 1] == '\r') word = word.substr(0, word.length - 1);
        word.trim();

        StopWordSet.add(word)
    });

    let wordsWithAmountsObject = {};

    wordsToFilterFrom.forEach((word) => {
        if(!StopWordSet.has(word) && word.length > 2) {

            illegalChars.forEach((char) => {
                word = word.replace(char, '');
            });
            word = word.toLowerCase();


            const flexedWord = ((word) => {
                switch ('number'){
                    case typeof wordsWithAmountsObject[word]:
                        return word;
                        break;
                    case typeof wordsWithAmountsObject[word + 'y']:
                        return word + 'y';
                        break;
                    case typeof wordsWithAmountsObject[word.substr(0, word.length - 1)]:
                        return word.substr(0, word.length - 1);
                        break;
                    case typeof wordsWithAmountsObject[word.substr(0, word.length - 1) + 'y']:
                        return word.substr(0, word.length - 1) + 'y';
                        break;
                    case typeof wordsWithAmountsObject[word.substr(0, word.length - 1) + 'i']:
                        return word.substr(0, word.length - 1) + 'i';
                        break;
                    case typeof wordsWithAmountsObject[word.substr(0, word.length - 1) + 'a']:
                        return word.substr(0, word.length - 1) + 'a';
                        break;
                    case typeof wordsWithAmountsObject[word.substr(0, word.length - 1) + 'e']:
                        return word.substr(0, word.length - 1) + 'e';
                        break;
                    default:
                        return null;

                }
            }) (word);

            if(flexedWord) wordsWithAmountsObject[flexedWord]++;
            else wordsWithAmountsObject[word] = 1;


        }
    });

    let wordsWithAmountsArray = [];
    for(let word in wordsWithAmountsObject) {
        if(wordsWithAmountsObject.hasOwnProperty(word)) {
            wordsWithAmountsArray.push({text: word, amount: wordsWithAmountsObject[word]})
        }
    }

    return wordsWithAmountsArray;
 }

function get(rawData) {

    let wordArray = [];

    rawData.map( (record) => {
        return record.title;
    }).forEach( (title, index) => {

        if(title) wordArray = wordArray.concat(title.split(' '));
        else console.log('Undefined title at ' + index)
    });

    return getFilteredWordAmountsArray(wordArray);
};

module.exports = get;

const testArray = ['abc', 'abc', ':abc', 'abc;', 'a:bc', 'def', 'def(', 'def]', 'ghi','jkl','nauka', 'nauki','naucz','naukowy','naukowosc', 'naukowi']
    .map((word) => {
        return {title: word, languages:['POL']}
        });

//console.log(get(testArray));