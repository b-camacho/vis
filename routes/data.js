var express = require('express');
var router = express.Router();
var m = require('../models');

router.get('/department/:name', function (req, res, next) {
    m.Department.findOne({shortName: req.params.name})
        .then(dept => {
            res.json(dept)
        })
        .catch(err => {
            console.log(err)
            res.status(400);
            res.send(err);
        })
});

router.get('/departments', function (req, res, next) {
    m.Department.find()
        .then(depts => {
            res.json(depts)
        })
        .catch(err => {
            console.log(err);
            res.status(400);
            res.send(err);
        })
});

router.get('/works', function (req, res, next) {
    console.log('sending:');
    console.log(req.session.works);
    res.json(req.session.works);
});

module.exports = router;
