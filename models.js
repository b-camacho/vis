/**
 * Created by nopony on 16/11/2016.
 */
var mg = require('mongoose');
var Models = {};

Models.Work = mg.model('Work', new mg.Schema( {
    year: {type: String},
    authors: {type: Array},
    authorsExpertusFormat: {type: Array},
    publicationType: {type: String, default: 'Book'}, // 'book', 'article'
    publishedIn: {type: String},
    pageRange: {type: String},
    pageAmount: {type: Number},
    title: {type: String},
    titleVariant: {type: String},
    invalid: {type: Object},
    sourceText: {type: String},
    department: {type: String},
    languages: {type: Array}
}));

Models.Person = mg.model('Person', new mg.Schema( {
    name: {type: String},
    works: {type: Array, default: []},
    department: {type: String},
    domain: {type: String},
    journals: {type: Object, default: {}},
    journalsNoVolumes: {type: Object, default: {}},
    journalsAmount: {type: Number, default: 0}
}));

module.exports = Models;