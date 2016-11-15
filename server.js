/**
 * Created by nopony on 05.08.16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var config = JSON.parse(fs.readFileSync('config.json').toString());

var retriever = require('./expertus-retriever');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.post('/search', function (req, res) {
    var uppercaseName = (req.body.surname + ' ' + req.body.name).toUpperCase();
    console.log('received ' + uppercaseName);
    retriever.run(uppercaseName, {mode: req.body.mode}, function (err, result) {
        res.json(result.reverse());
    })
});
app.post('/retrieve', function (req, res) {
    retriever.run(req.body.name, {mode:req.body.mode}, function (err, result) {
        res.send(result);
    })
})
app.listen(config.port || 3000, function () {
    console.log('Example app listening on port ' + (config.port || 3000));
});