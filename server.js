/**
 * Created by nopony on 05.08.16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json').toString());

var mg = require('mongoose');
mg.connect('mongodb://127.0.0.1/vis', function (err) {
    if (err) console.log(err);
    else console.log('Connected to mongoDB!')
});
var m = require('./models');
var Busboy = require('busboy');
var iconv = require('iconv-lite');
var parser = require('./parseUploadedExpertusFile');

const rawDbWordsParser = require('./getWordObjectsArray');

const geocoder = require('./geocoder');

app.use('/pl', express.static('public'));
app.use('/en', express.static('public-en'));
app.use(express.static('sources'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

if(!config.appSecret) console.log('Brak pola appSecret w pliku config.json');
app.use(session({
    secret: config.appSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mg.connection })
}));

app.get('/', function (req, res, next) {
    if(typeof req.session.lang !== 'undefined') res.redirect('/' + req.session.lang + '/');
    else res.redirect('/pl/')
})

app.post('/pl/*', function (req, res, next) {
    req.url = req.url.substr(3);
    req.session.lang = 'pl';
    next()
})
app.post('/en/*', function (req, res, next) {
    req.url = req.url.substr(3);
    req.session.lang = 'en';
    next()
})


app.post('/collab', function (req, res) {
    res.redirect('collab.html');
});
app.post('/collabData', function (req, res) {
    //console.log('Db lookup for ' + req.body.name);
    res.json(req.session.works);
});

app.post('/works', function (req, res) {
    res.redirect('works.html');
});
app.post('/worksData', function (req, res) {
    res.json(req.session.works);
});
app.post('/bubbles', function (req, res) {
    res.redirect('bubbles.html');
});
app.post('/research-map', function (req, res) {
    res.redirect('research-map.html');
});

app.post('/research-mapData', function (req, res) {
    res.json(req.session.works);
});

app.post('/bubblesData', function (req, res) {
    res.json(req.session.works);
});

const mapDataExamples = {
    worksWithLocations: [
        {
            lat: 53.0210671,
            lon: 18.618612,
            title: 'Tytuł pierszej pracy',
            city: 'Toruń'
        },
        {
            lat: 53.0210671,
            lon: 18.618612,
            title: 'Tytuł drugiej pracy',
            city: 'Toruń'
        },
        {
            lat: 53.0210671,
            lon: 18.618612,
            title: 'Tytuł trzeciej pracy',
            city: 'Toruń'
        },
        {
            lat: 54.3482259,
            lon: 18.6542888,
            title: 'Tytuł czwartej pracy',
            city: 'Gdańsk'
        },
        {
            lat: 54.3482259,
            lon: 18.6542888,
            title: 'Tytuł piątej pracy',
            city: 'Gdańsk'
        },
        {
            lat: 52.2319237,
            lon: 21.0067265,
            title: 'Tytuł szóstej pracy',
            city: 'Warszawa'
        }
    ]
};

app.post('/google-mapDataExamples', function (req, res) {
    console.log('Responding to map data request with examples');
    res.send(mapDataExamples)
})

app.post('/google-map', function (req, res) {
    geocoder.getLocations(req.session.works, (err, workObjectsWithLocations) => {
        res.json(workObjectsWithLocations);
    })

})


var Canvas = require("canvas");

var cloud = require("d3-cloud");

app.post('/wordcloudData', function (req, res) {

    if(!req.body.width) {
        console.log('Queried for wordcloud data without a width, using a default of 500');
        req.body.width = 500;
    }
    if(!req.body.height) {
        console.log('Queried for wordcloud data without a height, using a default of 500');
        req.body.height = 500;
    }

    req.body.width = req.body.width / 2;

    let polishEnd = false, englishEnd = false;
    let resultWords = {
        polish: null,
        english: null
    };
    const works = req.session.works;

    const wordsArray = rawDbWordsParser(works, 'polish')
        .sort(function (a, b) {
        if(a.amount < b.amount) return -1;
        if(a.amount > b.amount) return 1;
        return 0;
        })
        .reverse();


    const maxSize = Math.max(req.body.height, req.body.width) / 4, minSize = 5 ,
        maxAmount = wordsArray[0].amount, minAmount = 2;

    let words = wordsArray
        .map(function(el) {
            return {text: el.text, size: Math.max(el.amount/maxAmount * maxSize, minSize)};
        });

    cloud().size([req.body.width, req.body.height])
        .canvas(function() { return new Canvas(req.body.width, req.body.height); })
        .words(words)
        .padding(1)
        .rotate(0)
        //.rotate(function() { return Math.random() > 0.5 ? 90 : 0})
        .font(()=>{return 'sans-serif'})
        .fontSize(function(d) { return d.size; })
        .on("end", end)
        .start();

    function end(words) {
        resultWords.polish = words;
        polishEnd = true;
        if(polishEnd && englishEnd)
            res.json(resultWords);
    }

    const engWordsArray = rawDbWordsParser(works, 'english')
        .sort(function (a, b) {
            if(a.amount < b.amount) return -1;
            if(a.amount > b.amount) return 1;
            return 0;
        })
        .reverse();


    let engWords = engWordsArray
        .map(function(el) {
            return {text: el.text, size: Math.max(el.amount/maxAmount * maxSize, minSize)};
        });

    cloud().size([req.body.width, req.body.height])
        .canvas(function() { return new Canvas(req.body.width, req.body.height); })
        .words(engWords)
        .padding(1)
        .rotate(0)
        //.rotate(function() { return Math.random() > 0.5 ? 90 : 0})
        .font(()=>{return 'sans-serif'})
        .fontSize(function(d) { return d.size; })
        .on("end", engEnd)
        .start();

    function engEnd(words) {
        resultWords.english = words;
        englishEnd = true;
        if(polishEnd && englishEnd)
            res.json(resultWords);
    }


});


app.post('/upload', function (req, res) {
    var busboy = new Busboy({ headers: req.headers });
    var chunks = [];
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        file.on('data', function(chunk) {
            chunks.push(chunk);

        });
        file.on('end', function() {
            // console.log('File [' + fieldname + '] Finished');
            var fileBuffer = Buffer.concat(chunks);
            fileBuffer = iconv.decode(fileBuffer, "ISO-8859-2");
            try{
	            parser.parse(fileBuffer.toString(), (err, parsedObjects, queryName) => {
		            req.session.works = parsedObjects;
		            req.session.queryName = queryName;
		            console.log(req.session.works);
		            geocoder.getLocations(req.session.works, (err, workObjectsWithLocations) => {
			            req.session.works = workObjectsWithLocations;
		            })
	            });
            } catch (e) {

            }




        });
    });

    busboy.on('finish', function() {
        res.writeHead(303, { Connection: 'close', Location: '/' });
        res.end();
    });
    req.pipe(busboy);

})

app.get('/*/name', function (req, res) {
    if(req.session.queryName) res.send({available: true, name: req.session.queryName});
    else res.send({available:false, name: null});
})

app.listen(config.port || 3000, function () {
    console.log('Listening on port ' + (config.port || 3000));
});
