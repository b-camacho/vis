/**
 * Created by nopony on 22.03.17.
 */

var mg = require('mongoose');
var m = require('./models');
const NodeGeocoder = require('node-geocoder');
const request = require('request');
const config = JSON.parse(require('fs').readFileSync('config.json'));

// mg.connect('mongodb:localhost/vis', (err) => {
//     if(!err) console.log('geocoder connected to db');
//     else return console.log(err);
var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: config.googleKey, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};

const nodeGeocoder = NodeGeocoder(options);

const geocoder = {

    getLocations: function (workObjects, done) {
        let queryArray = [];
        let citiesToObjectsMap = {};
        workObjects.forEach((workObject) => {
            if(workObject.potentialCity == null) return;
            queryArray.push({name: workObject.potentialCity});
            citiesToObjectsMap[workObject.potentialCity] == undefined ?
                citiesToObjectsMap[workObject.potentialCity] = [workObject] :
                citiesToObjectsMap[workObject.potentialCity].push(workObject);
        });

        m.City.find({$or: queryArray}, (err, cities) => {
            cities.forEach((city) => {
                citiesToObjectsMap[city.name].forEach((workObject) => {
                    workObject.lat = city.lat;
                    workObject.lng = city.lng;
                    console.log('Added lat:'  + city.lat + ' to work ' + workObject.title)

                });
                citiesToObjectsMap[city.name].length = 0;
            })
        })

        let newCities = [];

        for(let cityName in citiesToObjectsMap)
            if(citiesToObjectsMap.hasOwnProperty(cityName)){
                newCities.push(cityName)
            }

        geocoder.queryForNewLocations(newCities, (err, geocodedObjects) => {
            geocodedObjects.forEach((object) => {
                if(citiesToObjectsMap[object.name] == undefined) return;
                citiesToObjectsMap[object.name].lat = object.lat;
                citiesToObjectsMap[object.name].lng = object.lng;

                let newCity = new m.City(object);
                newCity.save((err)=> {
                    console.log(err)
                });
            })
            //console.log(workObjects)
            done(null, workObjects);

        });



    },

    queryForNewLocations : function (cityList, done) {

        let waitingFor = cityList.length;
        let resolvedCities = [];

        cityList.forEach((city)=> {
            nodeGeocoder.geocode(city, (err, res) => {
                console.log('Resolving ' + city);
                if(err) {
                    waitingFor--;
                    if(waitingFor == 0) done(null, resolvedCities)
                }
                else {
                    resolvedCities.push({
                        name: city,
                        lat: res[0].latitude,
                        lng: res[0].longitude
                    });
                    waitingFor--;
                    if(waitingFor == 0) done(null, resolvedCities)
                }
            });


        })
    }

};

module.exports = geocoder;

// });