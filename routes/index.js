var express = require('express');
var router = express.Router();

var lang = {
	pl: require('../lang/pl.lang.json'),
	en: require('../lang/en.lang.json')
};

router.use('/', function (req, res, next) {
	res.data = res.data ? res.data : {};
	res.data.name = req.session.queryName || '';
	res.data.lang = req.session.lang === 'en' ? lang.en : lang.pl;
	next()
});

router.get('/', function (req, res) {
	res.render('dashboard', res.data)
});
router.get('/*', function (req, res, next) {
	var split = req.path.split('/');
	if(['bubbles', 'works', 'collab','research-map','google-map','wordcloud'].indexOf(split[split.length - 1]) !== -1) {
		res.data.visname = split[split.length - 1];
		if(req.path.substr(1) === 'google-map') {
			res.render('google-map', res.data);
			return
		}

		res.render('visualisation', res.data)
	}
	else next()
});

router.get('/en', function (req, res) {
	res.redirect('/')
});
router.get('/pl', function (req, res) {
	res.redirect('/')
});

module.exports = router