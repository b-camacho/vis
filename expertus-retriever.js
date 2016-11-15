/**
 * Created by nopony on 12/11/2016.
 */

var querystring = require('querystring');
var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var latin2 = require('iso-8859-2');

var retriever = {};





retriever.run = function (name, config, done) { //{mode: 'names'|'works'}
    var modeKey;
    if(!config) config = {mode:'names'};
    switch (config.mode){
        case 'names':
            modeKey = '0';
            break;
        case 'works':
            modeKey = 'a';
            break;
        default:
            modeKey = '0';
    }
    var keys = querystring.stringify({
        "B_00":"015",
//        "C_00":"",
//        "D_00":"",
        "FDT":"format-marc.fdt",
        "FST":"data.fst",
        "F_00":"02",
        "I_XX":modeKey,
        "KAT":"c:\\splendor\\umk\\par\\",
//        "LR":"43",
        "R_0":"524159",
        "STPL":"ANALYSIS",
        "V_00": name,
        "X_0":"1",
        "cond":"AND",
        "druk":"",
        "ekran":"ISO",
        "lnkmsk":"2",
        "mask":"1",
        "sort":"1,773,740,260",
        "su":"00"
    });
    var options = {
        "method": "POST",
        "hostname": "bg.cm.umk.pl",
        "port": null,
        "path": "/scripts/splendor/expert4e.exe",
        "headers": {
            "origin": "http://bg.cm.umk.pl",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36",
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(keys),
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "referer": "http://bg.cm.umk.pl/scripts/splendor/expert4e.exe",
            "accept-encoding": "gzip, deflate",
            "accept-language": "en-US,en;q=0.8",
            "cache-control": "no-cache",
            "postman-token": "0abfab7f-8845-c5b0-61d4-0eab30c96198"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks).toString();
            if(config.mode == 'works') {
                var rawExpertusText = parseHTMLIntoRecords(body);
                fs.writeFileSync('./raw-expertus-store/' + name + (Math.floor(Math.random() * 1000)) + '.txt', rawExpertusText)
                done(null, rawExpertusText);
            }
            if(config.mode == 'names') {
                var namesList = parseHTMLIntoListOfNames(body);
                done(null, namesList);
            }
        });
    });
    req.write(keys);
    req.end();

};

var parseHTMLIntoRecords = function (body) {
    var $ = cheerio.load(body);
    var records = $('.my_record');
    records.find('.label').each(function() {
        $(this).text('\r\n' + $(this).text());
    });
    return records.text();
};

var parseHTMLIntoListOfNames = function (body) {
    var $ = cheerio.load(body);
    var names = [];
    $('input[type=CHECKBOX]').each(function () {
        names.push($(this).val())
    });
    return names;
   // console.log(names);
};
//latin2.encode('Osińska Veslava', {mode: 'fatal'});
//retriever.run('osinska veslava', {mode: 'works'});
module.exports = retriever;