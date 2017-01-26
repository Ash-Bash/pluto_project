// Dependencies
var http = require('http');
var express = require('express');
var restful = require('node-restful');
var mongoose = restful.mongoose;
var bodyParser = require('body-parser');
var schema = mongoose.Schema;

// Connection Infomation
var port = 2000;

// MongoDB
mongoose.connect('mongodb://b00240396:admin@ds129189.mlab.com:29189/pluto_db');

// Express
var app = express();
// BodyParser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());

// Routes, Database Schema's and API's

////////////////////////////////////////////////////////
//--------------------Routes-Section------------------//
////////////////////////////////////////////////////////

// Routes
app.use(express.static(__dirname + "/public"));

////////////////////////////////////////////////////////
//---------------Database-Schema-Section--------------//
////////////////////////////////////////////////////////

// Database Schema's
// Newsfeeds Schema
var NewsFeedsSchema = schema ({
    name: String,
    icon: String,
    region: String,
    category: String,
    websiteUrl: String,
    feedUrl:String
});
var NewsFeeds = restful.model('newsfeeds', NewsFeedsSchema);
NewsFeeds.methods(['get', 'put', 'post', 'delete']);
NewsFeeds.register(app, '/api/data/newsfeeds');

////////////////////////////////////////////////////////
//-----------------------API-Section------------------//
////////////////////////////////////////////////////////

// Get API's

//------------------------Stations--------------------//

// Gets The Whole StationsList Database
app.get("/api/newsfeeds", function(req, res) {
    console.log("I Received a GET Request");

    NewsFeeds.find(function(err, newsfeeds) {
        console.log(newsfeeds);
        res.json(newsfeeds);
    });
});

// Gets a StationsList Item From The Database.
app.get('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("NewsFeed ID: " + id);

    NewsFeeds.findOne({ _id: id}, function(err, newsfeed){
        res.json(newsfeed);
    });
});

// Put API's

//------------------------Stations--------------------//

// Updates a StationList Item To The Database
app.put('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("NewsFeed ID: " + id);

    var newsfeeds = new NewsFeeds();

    // Allocates The Station Record data.
    newsfeeds.name = req.body.name;
    newsfeeds.icon = req.body.icon;
    newsfeeds.region = req.body.region;
    newsfeeds.category = req.body.category;
    newsfeeds.websiteUrl = req.body.websiteUrl;
    newsfeeds.feedUrl = req.body.feedUrl;

    var upsertedData = newsfeeds.toObject();

    delete upsertedData._id;

    NewsFeeds.update({ _id: id }, {$set: upsertedData }, {upsert: true}, function(err, newsfeed) {
        // we have the updated user returned to us
        console.log(newsfeed);
        res.json(newsfeed);
    });
});

// Post API's

//------------------------Stations--------------------//

// Posts a StationsList Item
app.post('/api/newsfeeds', function(req, res){
    console.log(req.body);

    var newsfeeds = new NewsFeeds();

    // Allocates The Station Record data.
    newsfeeds.name = req.body.name;
    newsfeeds.icon = req.body.icon;
    newsfeeds.region = req.body.region;
    newsfeeds.category = req.body.category;
    newsfeeds.websiteUrl = req.body.websiteUrl;
    newsfeeds.feedUrl = req.body.feedUrl;

    newsfeeds.save(function(err, newsfeed){
        res.json(newsfeed);
    });
});

// Delete API's

//------------------------Stations--------------------//

// Deletes a StationsList Item
app.delete('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("NewsFeed ID: " + id);

    NewsFeeds.remove({ _id: id }, function(err, newsfeed){
        res.json(newsfeed);
    });
});

////////////////////////////////////////////////////////
//-----------------Server-Info-Section----------------//
////////////////////////////////////////////////////////

// Starts Server
app.listen(port);
console.log('Elavate API and Web App is Running on port 2000');
