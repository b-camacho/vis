var express = require('express');
var PDFDocument = require('pdfkit');
var svgToPdf = require('svg-to-pdfkit');
var fs = require('fs');
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

router.get('/info/*', function (req, res, next) {
	var sub = req.path.split('/').pop() ;

	if(res.data.lang.info[sub]){
		res.data.info = res.data.lang.info[sub];
		res.render('text', res.data)
	}
	else {
		res.render('404', res.data);
	}
});

router.post('/genPdf', function (req, res, next) {

	var doc = new PDFDocument({layout: 'landscape', size: [595, 842]});
	doc.registerFont('Open Sans', 'sources/fonts/open-sans.regular.ttf');
	var tmpFilePath = './download/infovis'+ Math.random().toString(36).substr(2, 5) + '.pdf';
	var tmpWriteStream = fs.createWriteStream(tmpFilePath)
	doc.pipe(tmpWriteStream);
	doc.font('Open Sans').fontSize(25).fillColor('#ff6600')
		.text(req.body.args.title, 50, 40)
		.fillColor('#444dce').fontSize(18)
		.text(req.body.args.for + req.body.args.authorName);

	var visX = 50, visY = 100;
	var scale = Math.min(doc.page.width / req.body.args.width, doc.page.height / req.body.args.height, 1);
	req.body.svg = '<svg transform="scale(' + scale + ')"> ' + req.body.svg.substr(4);
	// if(req.body.args.type = "works") visY -= (req.body.args.height / 2);
	svgToPdf(doc, req.body.svg, visX, visY,{width:req.body.args.width, height: req.body.args.height});


	doc.image('sources/images/logo200.png', 50, doc.page.height - 100,{width: 50});
	doc.font('Open Sans').fontSize(12).fillColor('#191919')
		.text(req.body.args.caption_title + ' by UMK (\u00A9 2018)',120,doc.page.height - 100);


	tmpWriteStream.on('finish', function () {
		res.send(tmpFilePath)
	})

	setTimeout(function () {
		fs.unlink(tmpFilePath, console.log)
	}, 60000);

	doc.end()
})
// router.get('/en', function (req, res) {
// 	res.redirect('/')
// });
// router.get('/pl', function (req, res) {
// 	res.redirect('/')
// });

module.exports = router