const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const path = require('path');
const mg = require('mongoose');
mg.connect(config.dbConnStr, function (err) {
    if (err) console.log(err);
    else console.log('Connected to MongoDB')
});
const parser = require('./expertus');

const rawDbWordsParser = require('./wordcloudArray');

const Canvas = require("canvas");
const cloud = require("d3-cloud");

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

if(!config.appSecret) console.log('appSecret missing in config.json');
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


// Session switches - visiting these URLs persists a param to the session. Used for i18n and group/single vis select
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
});

app.get('/single', function (req, res, next) {
	req.session.group = false;
	res.data = res.data || {};
	res.data.group = req.session.group;
	res.redirect('/');
});

const router = require('./routes/index');
app.use('/', router);

app.post('/collabData', function (req, res) {
    //console.log('Db lookup for ' + req.body.name);
    res.json(req.session.works);
});

app.post('/worksData', function (req, res) {
    res.json(req.session.works);
});

app.post('/research-mapData', function (req, res) {
    res.json(req.session.works);
});

app.post('/bubblesData', function (req, res) {
    res.json(req.session.works);
});


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

app.post('/google-map', function (req, res) {
    res.json(req.session.works);
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
