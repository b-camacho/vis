const express = require('express');
const router = express.Router();
const m = require('../models');

const rawDbWordsParser = require('../wordcloudArray');
const Canvas = require("canvas");
const cloud = require("d3-cloud");

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
    res.json(req.session.works);
});

router.post('/wordcloud', function (req, res) {
    if(!req.body.width) {
        req.body.width = 500;
    }
    if(!req.body.height) {
        req.body.height = 500;
    }

    req.body.width = 1000
    req.body.height = 500

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
        })
        .filter((_, i) => i < 100);

    console.log([req.body.width, req.body.height])
    console.log(words.length)
    cloud().size([req.body.width, req.body.height])
        .canvas(function() { return new Canvas(req.body.width, req.body.height); })
        .words(words)
        .padding(1)
        .rotate(0)
        .font(()=>{return 'sans-serif'})
        .fontSize(function(d) { return d.size; })
        .on("end", end)
        .start();
    console.log('??')
    function end(words) {
        console.log('end called')
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

module.exports = router;
