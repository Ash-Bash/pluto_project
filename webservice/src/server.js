// Dependencies
var http = require('http');
var express = require('express');
var parser = require('rss-parser');
var feedRead = require("feed-read");
var restful = require('node-restful');
const Datastore = require('nedb');
const MercuryClient = require('mercury-client');
var bodyParser = require('body-parser');

// Creates a New Mercury Client (For Parsing Web Pages / Articles)
const mc = new MercuryClient('56gxBOmJ7SSsq8HHqN2DwTAi4LbE902GmUzBAAyL');

// Connection Infomation
var port = 2000;

// Debug Vars
var isDebug = false;

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
//----------------Misc-Functions-Section--------------//
////////////////////////////////////////////////////////


////////////////////////////////////////////////////////
//----------------Local-Database-Section--------------//
////////////////////////////////////////////////////////

//Initilizing Databases
var feeds = new Datastore({ filename: 'src/database/web_feeds.db' });
var requestedfeeds = new Datastore({ filename: 'src/database/web_requestedfeeds.db' });
var approvedfeeds = new Datastore({ filename: 'src/database/web_approvedfeeds.db' });

//Loading Databases Into Memory
// load each database (here we do it asynchronously)
feeds.loadDatabase(function (err) {    // Callback is optional
  // Now commands will be executed
  if(err) throw err;
});

requestedfeeds.loadDatabase(function (err) {    // Callback is optional
  // Now commands will be executed
  if(err) throw err;
});

approvedfeeds.loadDatabase(function (err) {    // Callback is optional
  // Now commands will be executed
  if(err) throw err;
});

////////////////////////////////////////////////////////
//-----------------------API-Section------------------//
////////////////////////////////////////////////////////

// Get API's

//----------------------RSS-Feed-Data-------------------//

app.get("/api/rssfeed/:url", function(req, res) {
  if (isDebug == true) {
    console.log("I Received a GET Request");
  }

    feedRead(decodeURIComponent(req.params.url), function(err, articles) {
      if (isDebug == true) {
        console.log(articles);
      }
      res.json(articles)
    });
    //fetch(decodeURIComponent(req.params.url), parse);
});

//----------------------Article-Data-------------------//
app.get("/api/article_page/:url", function(req, res) {
  mc.parse(decodeURIComponent(req.params.url))
  .then((data) => {
    if (isDebug == true) {
      console.log(data);
    }
    res.json(data)
  } )
  .catch((e) => { console.log('error', e)} )
});

//------------------------Newsfeeds--------------------//

// Gets The Whole Newsfeeds Database
app.get("/api/newsfeeds", function(req, res) {
  if (isDebug == true) {
    console.log("I Received a GET Request");
  }

    feeds.find({}, function (err, docs) {
      if(err) throw err;
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);
    });
});

// Gets a Newsfeeds Item From The Database.
app.get('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("NewsFeed ID: " + id);
    }

    feeds.findOne({_id: id}, function (err, docs) {
      if(err) throw err;
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);
    });
});

//------------------------RequestedFeeds--------------------//

// Gets The Whole RequestedFeeds Database
app.get("/api/requestedfeeds", function(req, res) {
    if (isDebug == true) {
      console.log("I Received a GET Request");
    }

    requestedfeeds.find({}, function (err, docs) {
      if(err) throw err;
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);
    });
});

// Gets a RequestedFeeds Item From The Database.
app.get('/api/requestedfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("requestedfeed ID: " + id);
    }

    requestedfeeds.findOne({_id: id}, function (err, docs) {
      if(err) throw err;
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);
    });
});

//------------------------ApprovedFeeds--------------------//

// Gets The Whole ApprovedFeeds Database
app.get("/api/approvedfeeds", function(req, res) {
    if (isDebug == true) {
      console.log("I Received a GET Request");
    }

    approvedfeeds.find({}, function (err, docs) {
      if(err) throw err;
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);
    });
});

// Gets a ApprovedFeeds Item From The Database.
app.get('/api/approvedfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("approvedfeed ID: " + id);
    }

    approvedfeeds.findOne({_id: id}, function (err, docs) {
      if(err) throw err;
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);
    });
});

// Put API's

//------------------------Newsfeeds--------------------//

// Updates a Newsfeeds Item To The Database
app.put('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("NewsFeed ID: " + id);
    }

    var feed = {
      name: req.body.name,
      icon: req.body.icon,
      region: req.body.region,
      category: req.body.category,
      websiteUrl: req.body.websiteUrl,
      feedUrl: req.body.feedUrl
    }

    feeds.update({ _id: id }, { $set: feed }, {upsert: true}, function (err, docs) {
      // we have the updated user returned to us
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);

    });
});

//------------------------RequestedFeeds--------------------//

// Updates a RequestedFeeds Item To The Database
app.put('/api/requestedfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("requestedfeed ID: " + id);
    }

    var feed = {
      name: req.body.name,
      icon: req.body.icon,
      region: req.body.region,
      category: req.body.category,
      websiteUrl: req.body.websiteUrl,
      feedUrl: req.body.feedUrl
    }

    requestedfeeds.update({ _id: id }, { $set: feed }, {upsert: true}, function (err, docs) {
      // we have the updated user returned to us
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);

    });
});

//------------------------ApprovedFeeds--------------------//

// Updates a ApprovedFeeds Item To The Database
app.put('/api/approvedfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("requestedfeed ID: " + id);
    }

    var feed = {
      name: req.body.name,
      icon: req.body.icon,
      region: req.body.region,
      category: req.body.category,
      websiteUrl: req.body.websiteUrl,
      feedUrl: req.body.feedUrl
    }

    approvedfeeds.update({ _id: id }, { $set: feed }, {upsert: true}, function (err, docs) {
      // we have the updated user returned to us
      if (isDebug == true) {
        console.log(docs);
      }
      res.json(docs);

    });
});

// Post API's

//------------------------Newsfeeds--------------------//

// Posts a Newsfeeds Item
app.post('/api/newsfeeds', function(req, res){
    if (isDebug == true) {
      console.log(req.body);
    }

    var feed = {
      name: req.body.name,
      icon: req.body.icon,
      region: req.body.region,
      category: req.body.category,
      websiteUrl: req.body.websiteUrl,
      feedUrl: req.body.feedUrl
    }

    feeds.insert(feed, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      res.json(newDoc);
    });
});

//------------------------RequestedFeeds--------------------//

// Posts a RequestedFeeds Item
app.post('/api/requestedfeeds', function(req, res){
    if (isDebug == true) {
      console.log(req.body);
    }

    var feed = {
      name: req.body.name,
      icon: req.body.icon,
      region: req.body.region,
      category: req.body.category,
      websiteUrl: req.body.websiteUrl,
      feedUrl: req.body.feedUrl
    }

    requestedfeeds.insert(feed, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      res.json(newDoc);

    });
});

//------------------------ApprovedFeeds--------------------//

// Posts a ApprovedFeeds Item
app.post('/api/approvedfeeds', function(req, res){
    if (isDebug == true) {
      console.log(req.body);
    }

    var feed = {
      name: req.body.name,
      icon: req.body.icon,
      region: req.body.region,
      category: req.body.category,
      websiteUrl: req.body.websiteUrl,
      feedUrl: req.body.feedUrl
    }

    approvedfeeds.insert(feed, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      res.json(newDoc);

    });
});

// Delete API's

//------------------------Newsfeeds--------------------//

// Deletes a Newsfeeds Item
app.delete('/api/newsfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("NewsFeed ID: " + id);
    }

    feeds.remove({ _id: id }, {}, function (err, numRemoved) {
      if(err) throw err;

    });
});

//------------------------RequestedFeeds--------------------//

// Deletes a RequestedFeeds Item
app.delete('/api/requestedfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("requestedfeed ID: " + id);
    }

    requestedfeeds.remove({ _id: id }, {}, function (err, numRemoved) {
      if(err) throw err;

    });
});

//------------------------ApprovedFeeds--------------------//

// Deletes a ApprovedFeeds Item
app.delete('/api/approvedfeeds/:id', function(req, res){
    var id = req.params.id;
    if (isDebug == true) {
      console.log("ApprovedFeed ID: " + id);
    }

    approvedfeeds.remove({ _id: id }, {}, function (err, numRemoved) {
      if(err) throw err;

    });
});

////////////////////////////////////////////////////////
//-----------------Server-Info-Section----------------//
////////////////////////////////////////////////////////

// Starts Server
app.listen(port);
console.log('Pluto API and Web App is Running on port 2000');
