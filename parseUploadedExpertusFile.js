/**
 * Created by nopony on 20.03.17.
 */

var parser = {};

const labels = [
    {

    }
]

parser.parse = function (rawText, done) {
    const exp1 = new RegExp(/<BR> [0-9]{0,3}\. <BR>/);
    const exp2 = new RegExp(/<span class="label">/);

    let recordObjectsArray = [];

    const rawTextArray = rawText.split(exp1);

    console.log(rawTextArray.length + ' records in total');

    rawTextArray.forEach((record, index) => {
        if(index == 0) return;

        let recordObject = {
            authorsExpertusFormat: [],
            languages: [],
            keywords: [],
            authors: []
        };

        const recordArray = record.split(exp2);

        const redundantSufix = '</UL></span>';

        recordArray.forEach( (line) => {
            const splitLine = line.substr(0, line.length - 4).split(': </span>');

            switch (splitLine[0]) {
                case 'Aut.':
                    splitLine[1].split(',').forEach((name) => {
                        name = name.trim();
                        recordObject.authorsExpertusFormat.push(name);
                        recordObject.authors.push(name);
                    });
                    break;

                case 'Tytuł':
                    recordObject.title = splitLine[1];
                    break;

                case 'Tytuł równoległy':
                    recordObject.titleVariant = splitLine[1];
                    break;

                case 'Opis wydawn.':
                    recordObject.potentialCity =  splitLine[1].split(':').length != 1 ?
                        splitLine[1].split(':')[0] :
                        null;

                    recordObject.year = Number.parseInt(splitLine[1].substr(splitLine.length - 6));
                    break;

                case 'Typ formalny publikacji':
                    recordObject.publicationTypeNumber = Number.parseInt(splitLine[1]);
                    recordObject.publicationType = 'article';

                    if(recordObject.publicationTypeNumber == 4) {
                        recordObject.publicationType = 'book';
                    }
                    break;

                case 'Język':
                    recordObject.languages.push(splitLine[1]);
                    break;

                case 'Polskie słowa kluczowe':
                    splitLine[1].split('<LI>').forEach((elem, index) => {
                        if(index == 0) return;
                       elem = elem.split(redundantSufix).join('');
                        recordObject.keywords.push(elem.trim());
                    });
                    break;

                case 'Opis fiz.':
                    const pageRange = splitLine[1].match(/[0-9]{1,5}-[0-9]{1,5}/);
                    if(pageRange != null) {
                        const pageArray = pageRange[0].split('-');
                        recordObject.pageRange = pageRange[0];
                        recordObject.pageAmount = Number.parseInt(pageArray[1]) - Number.parseInt(pageArray[0]) + 1;
                    }
                    else if(line.match(/[0-9]{1,5}/) != null) {
                        recordObject.pageRange = '0-' + splitLine[1].match(/[0-9]{1,5}/)[0].trim();
                        recordObject.pageAmount = Number.parseInt(splitLine[1].match(/[0-9]{1,5}/)[0].trim());
                    }
                    else  {
                        console.log(new Error('Failed RegExp parse at pageRange of line: ' + splitLine[1]).message)
                        recordObject.invalid["300"] = 'Could not infer page range from description';
                        recordObject.unparsedPageAmount = line.substr(4);
                    }
                    break;

            }


        });

        recordObjectsArray.push(recordObject);

    });
    done(null, recordObjectsArray);

}



module.exports = parser;
