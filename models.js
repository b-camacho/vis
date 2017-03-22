/**
 * Created by nopony on 16/11/2016.
 */
var mg = require('mongoose');
var Models = {};

Models.Work = mg.model('Work', new mg.Schema( {
    year: {type: String},
    potentialCity: String,
    city: String,
    authors: [String],
    authorsExpertusFormat: [String],
    publicationType: {type: String, default: 'Book'}, // 'book', 'article'
    publishedIn: {type: String},
    pageRange: {type: String},
    pageAmount: {type: Number},
    unparsedPageAmount: String,
    title: {type: String},
    titleVariant: {type: String},
    invalid: {type: Object},
    sourceText: {type: String},
    department: {type: String},
    languages: [String] //['POL', 'ENG'...]
}));

Models.Person = mg.model('Person', new mg.Schema( {
    name: {type: String},
    aliases: [String],
    works: [String], //Obj ID
    department: {type: String},
    domain: {type: String},
    journals: {type: Object, default: {}},
    journalsNoVolumes: {type: Object, default: {}},
    journalsAmount: {type: Number, default: 0},
    cloneOf: String
}));

Models.City = mg.model('City', new mg.Schema( {
    name: {type:String, required: true},
    lat: {type: Number, required: true},
    lng: {type: Number, required: true}
}));

module.exports = Models;