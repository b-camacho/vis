var express = require('express');
var router = express.Router();

var lang = {
    pl: require('../lang/pl.lang.json'),
    en: require('../lang/en.lang.json')
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

module.exports = router
