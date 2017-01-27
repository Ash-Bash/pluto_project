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

// RequestedFeeds Schema
var RequestedFeedsSchema = schema ({
    name: String,
    icon: String,
    region: String,
    category: String,
    websiteUrl: String,
    feedUrl:String
});
var RequestedFeeds = restful.model('requestedfeeds', RequestedFeedsSchema);
RequestedFeeds.methods(['get', 'put', 'post', 'delete']);
RequestedFeeds.register(app, '/api/data/requestedfeeds');

// RequestedFeeds Schema
var ApprovedFeedsSchema = schema ({
    name: String,
    icon: String,
    region: String,
    category: String,
    websiteUrl: String,
    feedUrl:String
});
var ApprovedFeeds = restful.model('approvedfeeds', ApprovedFeedsSchema);
ApprovedFeeds.methods(['get', 'put', 'post', 'delete']);
ApprovedFeeds.register(app, '/api/data/approvedfeeds');

////////////////////////////////////////////////////////
//-----------------------API-Section------------------//
////////////////////////////////////////////////////////

// Get API's

//------------------------Newsfeeds--------------------//

// Gets The Whole Newsfeeds Database
app.get("/api/newsfeeds", function(req, res) {
    console.log("I Received a GET Request");

    NewsFeeds.find(function(err, newsfeeds) {
        console.log(newsfeeds);
        res.json(newsfeeds);
    });
});

// Gets a Newsfeeds Item From The Database.
app.get('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("NewsFeed ID: " + id);

    NewsFeeds.findOne({ _id: id}, function(err, newsfeed){
        res.json(newsfeed);
    });
});

//------------------------RequestedFeeds--------------------//

// Gets The Whole RequestedFeeds Database
app.get("/api/requestedfeeds", function(req, res) {
    console.log("I Received a GET Request");

    RequestedFeeds.find(function(err, requestedfeeds) {
        console.log(requestedfeeds);
        res.json(requestedfeeds);
    });
});

// Gets a RequestedFeeds Item From The Database.
app.get('/api/requestedfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("requestedfeed ID: " + id);

    RequestedFeeds.findOne({ _id: id}, function(err, requestedfeeds){
        res.json(requestedfeeds);
    });
});

//------------------------ApprovedFeeds--------------------//

// Gets The Whole ApprovedFeeds Database
app.get("/api/approvedfeeds", function(req, res) {
    console.log("I Received a GET Request");

    ApprovedFeeds.find(function(err, approvedfeeds) {
        console.log(approvedfeeds);
        res.json(approvedfeeds);
    });
});

// Gets a ApprovedFeeds Item From The Database.
app.get('/api/approvedfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("approvedfeed ID: " + id);

    ApprovedFeeds.findOne({ _id: id}, function(err, approvedfeeds){
        res.json(approvedfeeds);
    });
});

// Put API's

//------------------------Newsfeeds--------------------//

// Updates a Newsfeeds Item To The Database
app.put('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("NewsFeed ID: " + id);

    var newsfeeds = new NewsFeeds();

    // Allocates The Newsfeed Record data.
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

//------------------------RequestedFeeds--------------------//

// Updates a RequestedFeeds Item To The Database
app.put('/api/requestedfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("requestedfeed ID: " + id);

    var requestedfeeds = new RequestedFeeds();

    // Allocates The RequestedFeed Record data.
    requestedfeeds.name = req.body.name;
    requestedfeeds.icon = req.body.icon;
    requestedfeeds.region = req.body.region;
    requestedfeeds.category = req.body.category;
    requestedfeeds.websiteUrl = req.body.websiteUrl;
    requestedfeeds.feedUrl = req.body.feedUrl;

    var upsertedData = requestedfeeds.toObject();

    delete upsertedData._id;

    RequestedFeeds.update({ _id: id }, {$set: upsertedData }, {upsert: true}, function(err, requestedfeed) {
        // we have the updated user returned to us
        console.log(requestedfeed);
        res.json(requestedfeed);
    });
});

//------------------------ApprovedFeeds--------------------//

// Updates a ApprovedFeeds Item To The Database
app.put('/api/approvedfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("requestedfeed ID: " + id);

    var approvedfeeds = new ApprovedFeeds();

    // Allocates The ApprovedFeed Record data.
    approvedfeeds.name = req.body.name;
    approvedfeeds.icon = req.body.icon;
    approvedfeeds.region = req.body.region;
    approvedfeeds.category = req.body.category;
    approvedfeeds.websiteUrl = req.body.websiteUrl;
    approvedfeeds.feedUrl = req.body.feedUrl;

    var upsertedData = approvedfeeds.toObject();

    delete upsertedData._id;

    ApprovedFeeds.update({ _id: id }, {$set: upsertedData }, {upsert: true}, function(err, approvedfeed) {
        // we have the updated user returned to us
        console.log(approvedfeed);
        res.json(approvedfeed);
    });
});

// Post API's

//------------------------Newsfeeds--------------------//

// Posts a Newsfeeds Item
app.post('/api/newsfeeds', function(req, res){
    console.log(req.body);

    var newsfeeds = new NewsFeeds();

    // Allocates The Newsfeed Record data.
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

//------------------------RequestedFeeds--------------------//

// Posts a RequestedFeeds Item
app.post('/api/requestedfeeds', function(req, res){
    console.log(req.body);

    var requestedfeeds = new RequestedFeeds();

    // Allocates The RequestedFeed Record data.
    requestedfeeds.name = req.body.name;
    requestedfeeds.icon = req.body.icon;
    requestedfeeds.region = req.body.region;
    requestedfeeds.category = req.body.category;
    requestedfeeds.websiteUrl = req.body.websiteUrl;
    requestedfeeds.feedUrl = req.body.feedUrl;

    requestedfeeds.save(function(err, requestedfeed){
        res.json(requestedfeed);
    });
});

//------------------------ApprovedFeeds--------------------//

// Posts a ApprovedFeeds Item
app.post('/api/approvedfeeds', function(req, res){
    console.log(req.body);

    var approvedfeeds = new ApprovedFeeds();

    // Allocates The ApprovedFeed Record data.
    approvedfeeds.name = req.body.name;
    approvedfeeds.icon = req.body.icon;
    approvedfeeds.region = req.body.region;
    approvedfeeds.category = req.body.category;
    approvedfeeds.websiteUrl = req.body.websiteUrl;
    approvedfeeds.feedUrl = req.body.feedUrl;

    approvedfeeds.save(function(err, approvedfeed){
        res.json(approvedfeed);
    });
});

// Delete API's

//------------------------Newsfeeds--------------------//

// Deletes a Newsfeeds Item
app.delete('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("NewsFeed ID: " + id);

    NewsFeeds.remove({ _id: id }, function(err, newsfeed){
        res.json(newsfeed);
    });
});

//------------------------RequestedFeeds--------------------//

// Deletes a RequestedFeeds Item
app.delete('/api/requestedfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("requestedfeed ID: " + id);

    RequestedFeeds.remove({ _id: id }, function(err, requestedfeed){
        res.json(requestedfeed);
    });
});

//------------------------ApprovedFeeds--------------------//

// Deletes a ApprovedFeeds Item
app.delete('/api/approvedfeeds/:id', function(req, res){
    var id = req.params.id;
    console.log("ApprovedFeed ID: " + id);

    ApprovedFeeds.remove({ _id: id }, function(err, approvedfeed){
        res.json(approvedfeed);
    });
});

////////////////////////////////////////////////////////
//-----------------Server-Info-Section----------------//
////////////////////////////////////////////////////////

// Starts Server
app.listen(port);
console.log('Pluto API and Web App is Running on port 2000');
