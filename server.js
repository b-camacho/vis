/**
 * Created by nopony on 05.08.16.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');
var fs = require('fs');
/*
var publicDirectories = [
    'css',
    'html',
    'fonts',
    'js'
];
publicDirectories.forEach(function(directory) {
    app.use(express.static('/' + directory));
});*/
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(busboy());
/*app.use(express.json());
app.use(express.urlencoded());*/

app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.post('/scholar-csv', function (req, res) {

    console.log(req.body)
    /*req.busboy.on('file', function(fieldname, file, filename) {
        console.log('Started uploading ' + filename);
        console.log(file);
    })*/

    res.send('success');
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});