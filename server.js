const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config.json');
const path = require('path');
const mg = require('mongoose');
mg.Promise = global.Promise;
mg.connect(config.dbConnStr, {useMongoClient: true}, function (err) {
    if (err) console.log(err);
    else console.log('Connected to MongoDB')
});
const parser = require('./expertus');

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
