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

var retriever = require('./expertus-retriever');

const rawDbWordsParser = require('./getWordObjectsArray');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/retrieve', function (req, res) {
    retriever.run(req.body.name, {mode: req.body.mode}, function (err, result) {
        console.log('Done retrieving, result: ' + result);
        res.json(JSON.stringify(result));
    });
});


// app.post('/retrieve', function (req, res) {
//     retriever.run(req.body.name, {mode:req.body.mode}, function (err, result) {
//         res.send(result);
//     })
// });

app.post('/collab', function (req, res) {
    console.log(req.body.name);
    res.redirect('collab.html');
    /* m.Work.find({authors: req.body.name}, function (err, works) {
     res.send(works);
     })*/
});
app.post('/collabData', function (req, res) {
    console.log('Db lookup for ' + req.body.name);
    m.Work.find({authors: req.body.name}, function (err, works) {
        res.send(works);
    })
});

app.post('/works', function (req, res) {
    console.log(req.body.name);
    res.redirect('works.html');
});
app.post('/worksData', function (req, res) {
    console.log('Db lookup for ' + req.body.name);
    m.Work.find({authors: req.body.name}, function (err, works) {
        res.send(works);
    })
});
app.post('/bubbles', function (req, res) {
    res.redirect('bubbles.html');
});
app.post('/research-map', function (req, res) {
    res.redirect('research-map.html');
});

app.post('/bubblesData', function (req, res) {
    console.log('Initiating page amounts for bubbles query for: ' + req.body.name);
    m.Work.find({authors: req.body.name}, function (err, works) {
        res.json(works);
    })
});

var Canvas = require("canvas");

var cloud = require("d3-cloud");

app.post('/wordcloudData', function (req, res) {

    if(!req.body.width) {
        console.log('Queried for wordcloud data without a width, using a default of 500')
        req.body.width = 500;
    }
    if(!req.body.height) {
        console.log('Queried for wordcloud data without a height, using a default of 500')

        req.body.height = 500;
    }
    m.Work.find({authors: req.body.name}, function (err, works) {

        let worksPolishOnly = [];
        works.forEach((work) => {
            work.languages.includes("POL") ? worksPolishOnly.push(work) : null;
        });



        const wordsArray = rawDbWordsParser(worksPolishOnly)
            .sort(function (a, b) {
            if(a.amount < b.amount) return -1;
            if(a.amount > b.amount) return 1;
            return 0;
            })
            .reverse();

        console.log(wordsArray.slice(0, 10));

        const maxSize = Math.min(req.body.height, req.body.width) * 1.5 / wordsArray[0].amount, minSize = 10,
            maxAmount = wordsArray[0].amount, minAmount = 1;

        let words = wordsArray
            .map(function(el) {
                return {text: el.text, size: Math.max(Math.pow(el.amount/maxAmount, 0.5) * maxSize, minSize)};
            });

        cloud().size([req.body.width, req.body.height])
            .canvas(function() { return new Canvas(req.body.width, req.body.height); })
            .words(words)
            .padding(1)
            .rotate(function() { return Math.random() > 0.5 ? 90 : 0})
            .font(()=>{return 'sans-serif'})
            .fontSize(function(d) { return d.size; })
            .on("end", end)
            // .spiral('rectangular')
            .start();

        function end(words) { res.json(words); }

    })
});


app.get('/name-lookup', function (req, res) {
    console.log(req.query.name);
    retriever.run(req.query.name, {mode: 'names'}, function (err, result) {
        console.log(err);
        res.send(result);
    });
})

app.listen(config.port || 3000, function () {
    console.log('Example app listening on port ' + (config.port || 3000));
});