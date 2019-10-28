var express = require('express');
var router = express.Router();
var m = require('./models');

var lang = {
    pl: require('./lang/pl.lang.json'),
    en: require('./lang/en.lang.json')
};

router.use('*', function (req, res, next) {
    res.data = res.data ? res.data : {};
    res.data.name = req.session.queryName || '';
    res.data.lang = req.session.lang === 'en' ? lang.en : lang.pl;
    res.data.group = req.session.group;
    res.data.works = req.session.works;

    m.Department.find().then(deps => {
        res.data.saved = deps;
        next();
    })
});

// Session switches - visiting these URLs persists a param to the session. Used for i18n and group/single vis select
router.get('/pl', function (req, res, next) {
    req.url = req.url.substr(3);
    req.session.lang = 'pl';
    res.redirect('/')
});
router.get('/en', function (req, res, next) {
    req.url = req.url.substr(3);
    req.session.lang = 'en';
    res.redirect('/')
});

module.exports = router
