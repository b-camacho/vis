/**
 * Created by nopony on 05.08.16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json').toString());
var path = require('path');
var mg = require('mongoose');
mg.connect('mongodb://127.0.0.1/vis', function (err) {
    if (err) console.log(err);
    else console.log('Connected to mongoDB!')
});
var m = require('./models');
var parser = require('./expertus');

var rawDbWordsParser = require('./wordcloudArray');

app.use(express.static('sources'));
app.use('/dist', express.static('dist'));
app.use('/download', express.static('download'));
app.use('/favicons', express.static('favicons'));
app.use(bodyParser.json({
    limit: '50mb'
}));
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '5mb'
}));

const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

if(!config.appSecret) console.log('Brak pola appSecret w pliku config.json');
app.use(session({
    secret: config.appSecret,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mg.connection }),
    cookie: {
        maxAge: 1200000
    }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/pl', function (req, res, next) {
	req.url = req.url.substr(3);
	req.session.lang = 'pl';
	res.redirect('/')
});
app.get('/en', function (req, res, next) {
	req.url = req.url.substr(3);
	req.session.lang = 'en';
	res.redirect('/')
});


app.get('/group', function (req, res, next) {
	req.session.works = null;
	req.session.queryName = null;
	req.session.group = true;

	res.redirect('/');
})

app.get('/single', function (req, res, next) {
	req.session.group = false;
	res.data = res.data || {};
	res.data.group = req.session.group;

	res.redirect('/');
})

const router = require('./routes/index');
app.use('/', router);

// app.get('/', function (req, res, next) {
//     if(typeof req.session.lang !== 'undefined') res.redirect('/' + req.session.lang + '/');
//     else res.redirect('/pl/')
// });




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


app.post('/google-map', function (req, res) {

	res.json(req.session.works);
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


    const maxSize = Math.max(req.body.height, req.body.width) / 4, minSize = 11,
        maxAmount = wordsArray[0].amount, minAmount = 2;

    let words = wordsArray
        .map(function(el) {
            return {text: el.text, size: Math.max(Math.log2(el.amount/maxAmount * 100) * maxSize, minSize)};
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
	parser.upload(req, function (err, file) {
		if(err) {
			return res.redirect('/error/upload')
		}
		parser.parse(file, function (err, works, name) {
			if(err) {
				return res.redirect('/error/upload')
			}
			req.session.works = works;
			req.session.queryName = name;
			res.redirect('/')
		})
	})
});



app.get('/*/name', function (req, res) {
    if(req.session.queryName) res.send({available: true, name: req.session.queryName});
    else res.send({available:false, name: null});
});

app.listen(config.port || 3000, function () {
    console.log('Listening on port ' + (config.port || 3000));
});
