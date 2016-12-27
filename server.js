/**
 * Created by nopony on 05.08.16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json').toString());

var mg = require('mongoose');
mg.connect('mongodb://localhost/vis');
var m = require('./models');

var retriever = require('./expertus-retriever');

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

app.post('/bubblesData', function (req, res) {
    console.log('Initiating page amounts for bubbles query for: ' + req.body.name);
    m.Work.find({authors: req.body.name}, function (err, works) {
        res.json(works);
    })
});

app.listen(config.port || 3000, function () {
    console.log('Example app listening on port ' + (config.port || 3000));
});