////////////////////////////////////////////////////////
//-----------------Dependencies-Section---------------//
////////////////////////////////////////////////////////
const {BrowserWindow} = require('electron').remote;
const MercuryClient = require('mercury-client');
var remote = require('electron').remote;
var Datastore = require('nedb');
//var Feed = require("feed-read-parser");

const mc = new MercuryClient('56gxBOmJ7SSsq8HHqN2DwTAi4LbE902GmUzBAAyL');

////////////////////////////////////////////////////////
//------------AngularJS-Controllers-Section-----------//
////////////////////////////////////////////////////////

angular.module('BlankApp',['ngMaterial', 'ngMdIcons', "ngSanitize"])

.factory('FeedService',['$http',function($http){
    return {
        parseFeed : function(url){
            return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=15&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
      }
}])

//Main Application AngularJS Controller
.controller('ApplicationController', function($mdMedia, $timeout, $mdSidenav, $mdDialog, $mdUtil, $scope, $http, $compile, $sanitize, FeedService) {

  //AngularJS / $scope Variables
  $scope.webserviceAddress = "http://localhost:2000";
  $scope.isMobile = true;
  $scope.isTablet = false;
  $scope.isDesktop = false;
  $scope.isBiggerScreenSize = false;
  $scope.isFullScreenMode = false;
  $scope.isMaximized = false;

  //View Management Variables
  $scope.IsAllNewsHomeViewSelected = true;
  $scope.IsMyFeedsHomeViewSelected = false;
  $scope.IsFeed_HomeViewSelected = false;
  $scope.IsFeed_MyFeedsViewSelected = false;
  $scope.IsMyFeedsSelected = true;
  $scope.IsFavoritesSelected = true;
  $scope.IsReadLaterSelected = false;

  $scope.zoomFactor = 0;

  $scope.selectedIndex = 0;

  $scope.newsfeeds = "";
  $scope.feed = "";

  // RSS Feed Variables
  $scope.rssFeedData = {};

  // Database Document Objects
  $scope.app_feeds_doc = {};
  $scope.app_favorites_doc = {};
  $scope.app_readlater_doc = {};
  $scope.app_history_doc = {};

  // Database Document List Objects
  $scope.app_feeds_data = {};
  $scope.app_favorites_data = {};
  $scope.app_readlater_data = {};
  $scope.app_history_data = {};

  $scope.currentSelectedFeed_HomeView = {};
  $scope.currentSelectedFeed_MyFeedsView = {};
  $scope.currentSelectedFeedItem_HomeView = {};
  $scope.currentSelectedFeedItem_MyFeedsView = {};
  $scope.currentSelectedHistory_HistoryView = {};
  $scope.currentSelectedFavorites_FavoritesView = {};
  $scope.currentSelectedFavorites_FavSplitView = {};
  $scope.currentSelectedReadLater_ReadLaterView = {};
  $scope.currentSelectedReadLater_FavSplitView = {};

  $scope.rssFeedName = "No Feed";
  $scope.rssFeedIcon = "";
  $scope.rssFeedRelIcon = "";

  //Non $scope Variables
  var feeddata = null;

  ////////////////////////////////////////////////////////
  //----------------Local-Database-Section--------------//
  ////////////////////////////////////////////////////////

  //Initilizing Databases
  var feeds = new Datastore({ filename: 'app/database/app_feeds.db', autoload: true });
  var pins = new Datastore({ filename: 'app/database/app_pins.db', autoload: true });
  var favorites = new Datastore({ filename: 'app/database/app_favorites.db', autoload: true });
  var readlater = new Datastore({ filename: 'app/database/app_readlater.db', autoload: true });
  var history = new Datastore({ filename: 'app/database/app_history.db', autoload: true });

  ////////////////////////////////////////
  //-------HTTP/Network-Functions-------//
  ////////////////////////////////////////
  // HTTP Get Requests
  // Gets Newsfeeds Database
  var refresh = function() {
      $http.get($scope.webserviceAddress + '/api/newsfeeds').then(function (response) {
          console.log("I got My Data I Requested");
          for (let i = response.data.length; i; i--) {
              let j = Math.floor(Math.random() * i);
              [response.data[i - 1], response.data[j]] = [response.data[j], response.data[i - 1]];
          }
          $scope.newsfeeds = response.data;
          $scope.feed = "";
          for (var i = 0; i < $scope.newsfeeds.length; i++) {
            var icon = $scope.newsfeeds[i].icon
            $scope.newsfeeds[i].icon = $scope.webserviceAddress + icon
            $scope.newsfeeds[i].relicon = icon;
          }
      });

      //Loading Databases Into Memory
      // load each database (here we do it asynchronously)
      feeds.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        feeds.find({}, function (err, docs) {
          feeddata = docs;
          if(err) throw err;
          loadFeedData(feeddata);
        });
      });
      pins.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        pins.find({}, function (err, docs) {
          //feeddata = docs;
          if(err) throw err;
          //loadFeedData(feeddata);
        });

      });
      favorites.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        favorites.find({}, function (err, docs) {
          if(err) throw err;
          loadFavoritesData(docs);
        });
      });
      readlater.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        readlater.find({}, function (err, docs) {
          if(err) throw err;
          loadReoadLaterData(docs);
        });
      });
      history.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        history.find({}, function (err, docs) {
          if(err) throw err;
          loadHistoryData(docs);
        });
      });

      // Find all documents in the collection
      /*db.find({}, function (err, docs) {
        $scope.app_feeds_data = docs;
      });*/
  };

  // Refresh WebPage
  refresh();

  //Generic function for looking up & toggle Sidenav's in the HTML File (Found in Angular Material Guides)
  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function () {
        $mdSidenav(navID)
            .toggle()
    }, 100);
    return debounceFn;
  }

  function loadFeedData(docs) {
    $scope.app_feeds_data = docs;

    for (var i = 0; i < $scope.app_feeds_data.length; i++) {
      var icon = $scope.app_feeds_data[i].icon
      $scope.app_feeds_data[i].icon = $scope.webserviceAddress + icon
      $scope.app_feeds_data[i].relicon = icon;
      $scope.app_feeds_data[i].feeddata = null;

      loadRSSFeedData(i, $scope.app_feeds_data[i].feedUrl)
    }
    //console.log($scope.app_feeds_data);
  }

  function loadHistoryData(docs) {
    $scope.app_history_data = docs;
  }

  function loadFavoritesData(docs) {
    $scope.app_favorites_data = docs;
  }

  function loadReoadLaterData(docs) {
    $scope.app_readlater_data = docs;
  }

  function loadRSSFeedData(id, feed) {
    $http.get($scope.webserviceAddress + '/api/rssfeed/' + encodeURIComponent(feed)).then(function (response) {
      //console.log(response);
        $scope.app_feeds_data[id].feeddata = response.data;

        for (var i = 0; i < $scope.app_feeds_data[id].feeddata.length; i++) {

          loadBodyTextFeedData(id, i, $scope.app_feeds_data[id].feeddata[i].link);
          //console.log($scope.app_feeds_data[id].feeddata[i]);
        }
    });

    /*RSSParser.parseURL(feed, function(err, parsed) {
      $scope.app_feeds_data[id].feeddata = parsed.feed.entries;

      for (var i = 0; i < $scope.app_feeds_data[id].feeddata.length; i++) {

        loadBodyTextFeedData(id, i, $scope.app_feeds_data[id].feeddata[i].link);
        //console.log($scope.app_feeds_data[id].feeddata[i]);
      }

      //console.log($scope.app_feeds_data[id].feeddata);
      //console.log($scope.app_feeds_data);
    });*/
  }

  function loadRSSData(feed) {
    RSSParser.parseURL(feed.feedUrl, function(err, parsed) {
      //console.log(parsed.feed);
      $scope.rssFeedData = parsed.feed.entries;

      for (var i = 0; i < $scope.rssFeedData.length; i++) {
        loadBodyText(i, $scope.rssFeedData[i].link);
        //$scope.rssFeedData[i].bodytext = bodytext;
        //console.log($scope.rssFeedData[i]);
      }
    });

    $scope.currentSelectedFeed_HomeView = feed;
    $scope.currentSelectedFeed_MyFeedsView = feed;
  }

  function loadBodyText(id, link) {
    /*$http.get($scope.webserviceAddress + '/api/article_page/' + encodeURIComponent(link)).then(function (response) {
      $scope.rssFeedData[id].bodytext = response.content;
    });*/
    mc.parse(link)
    .then((data) => {
      $scope.rssFeedData[id].bodytext = data.content;
    } )
    .catch((e) => { console.log('error', e)} )
  }

  function loadBodyTextFeedData(feedid, rssid, link) {
    /*
    $http.get($scope.webserviceAddress + '/api/article_page/' + encodeURIComponent(link)).then(function (response) {
      $scope.app_feeds_data[feedid].feeddata[rssid].bodytext = response.content;
    });
    */
    mc.parse(link)
    .then((data) => {
      $scope.app_feeds_data[feedid].feeddata[rssid].bodytext = data.content;
      //console.log($scope.app_feeds_data);
    } )
    .catch((e) => { console.log('error', e)} )
  }

  ////////////////////////////////////////
  //--------Home-View-Functions---------//
  ////////////////////////////////////////
  //Allows Views in the Home Section to be hidden or shown id IsAllNewsSelected is true or false
  $scope.viewHomeSections = function(id) {
    if(id == "All_News") {
      $scope.IsAllNewsHomeViewSelected = true;
      $scope.IsMyFeedsHomeViewSelected = false;
      $scope.IsFeed_HomeViewSelected = false;
      //refresh();
    } else if (id == "My_Feeds") {
      $scope.IsAllNewsHomeViewSelected = false;
      $scope.IsMyFeedsHomeViewSelected = true;
      $scope.IsFeed_HomeViewSelected = false;
      //refresh();
    }
  }

  ////////////////////////////////////////
  //------My-Feeds-View-Functions-------//
  ////////////////////////////////////////
  //Opens a Feed View to show the feed that the user selected
  $scope.openFeed = function(feed, ishomeview) {
    if (ishomeview == true) {
      if ($scope.IsFeed_HomeViewSelected == true) {
        $scope.IsFeed_HomeViewSelected = false;
        $scope.IsAllNewsHomeViewSelected = false;
        $scope.IsMyFeedsHomeViewSelected = true;
      } else if ($scope.IsFeed_HomeViewSelected == false) {
        $scope.rssFeedData = feed.feeddata;
        $scope.rssFeedName = feed.name;
        $scope.rssFeedIcon = feed.icon;
        $scope.rssFeedRelIcon = feed.relicon;
        $scope.IsFeed_HomeViewSelected = true;
        $scope.IsAllNewsHomeViewSelected = false;
        $scope.IsMyFeedsHomeViewSelected = false;
      }
    } else if (ishomeview == false) {
      if ($scope.IsFeed_MyFeedsViewSelected == true) {
        $scope.IsFeed_MyFeedsViewSelected = false;
        $scope.IsMyFeedsSelected = true;
      } else if ($scope.IsFeed_MyFeedsViewSelected == false) {
        $scope.rssFeedData = feed.feeddata;
        $scope.rssFeedName = feed.name;
        $scope.rssFeedIcon = feed.icon;
        $scope.rssFeedRelIcon = feed.relicon;
        $scope.IsFeed_MyFeedsViewSelected = true;
        $scope.IsMyFeedsSelected = false;
      }
    }
  }

  $scope.openFeedItem = function(feeditem, ishomeview) {
    if (ishomeview == true) {
      $scope.currentSelectedFeedItem_HomeView = feeditem;
      $scope.bodytext_myfeedshomeview = feeditem.bodytext;
      console.log($scope.currentSelectedFeedItem_HomeView);
      $scope.saveArticleToHistory($scope.rssFeedIcon, $scope.rssFeedRelIcon, feeditem);

      console.log($scope.currentSelectedFeedItem_HomeView);

    } else if (ishomeview == false) {
      $scope.currentSelectedFeedItem_MyFeedsView = feeditem;
      $scope.bodytext_myfeedsview = feeditem.bodytext;

      $scope.saveArticleToHistory($scope.rssFeedIcon, $scope.rssFeedRelIcon, feeditem);
    }
  }

  ////////////////////////////////////////
  //---Favorites-Splitview-Functions----//
  ////////////////////////////////////////
  //Allows Views in the Favorites SplitView Section to be hidden or shown id IsFavoritesSelected is true or false
  $scope.viewFavoritesSections = function(id) {
    if(id == "Favorites") {
      $scope.IsFavoritesSelected = true;
      //refresh();
    } else if (id == "Read_Later") {
      $scope.IsFavoritesSelected = false;
      //refresh();
    }
  }

  $scope.deleteFavoritesItemFromSPVFavoritesView = function() {
    $scope.deleteHistoryItem($scope.currentSelectedFavorites_FavSplitView);
  }

  $scope.addToFavoritesFromSPVReadLaterView = function() {
    $scope.saveArticleToFavorites($scope.currentSelectedReadLater_FavSplitView.icon, $scope.currentSelectedReadLater_FavSplitView.relicon, $scope.currentSelectedReadLater_FavSplitView);
  }

  $scope.deleteReadLaterItemFromSPVReadLaterView = function() {
    $scope.deleteHistoryItem($scope.currentSelectedReadLater_FavSplitView);
  }

  ////////////////////////////////////////
  //------Favorites-View-Functions------//
  ////////////////////////////////////////

  $scope.openFavoritesItem = function(feeditem, isFavSplitView) {
    if (isFavSplitView == true) {
      $scope.currentSelectedFavorites_FavSplitView = feeditem;
      $scope.bodytext_favoritesview = feeditem.bodytext;
    } else if (isFavSplitView == false){
      $scope.currentSelectedFavorites_FavoritesView = feeditem;
      $scope.bodytext_favoritesview = feeditem.bodytext;
    }
  }

  $scope.deleteFavoritesItemFromFavoritesView = function() {
    $scope.deleteHistoryItem($scope.currentSelectedFavorites_FavoritesView);
  }

  ////////////////////////////////////////
  //------ReadLater-View-Functions------//
  ////////////////////////////////////////

  $scope.openReadLaterItem = function(feeditem, isFavSplitView) {
    if (isFavSplitView == true) {
      $scope.currentSelectedReadLater_FavSplitView= feeditem;
      $scope.bodytext_readlaterview = feeditem.bodytext;
    } else if (isFavSplitView == false){
      $scope.currentSelectedReadLater_ReadLaterView= feeditem;
      $scope.bodytext_readlaterview = feeditem.bodytext;
    }
  }

  $scope.addToFavoritesFromReadLaterView = function() {
    $scope.saveArticleToFavorites($scope.currentSelectedReadLater_ReadLaterView.icon, $scope.currentSelectedReadLater_ReadLaterView.relicon, $scope.currentSelectedReadLater_ReadLaterView);
  }

  $scope.deleteReadLaterItemFromReadLaterView = function() {
    $scope.deleteHistoryItem($scope.currentSelectedReadLater_ReadLaterView);
  }

  ////////////////////////////////////////
  //-------History-View-Functions-------//
  ////////////////////////////////////////

  $scope.openHistoryItem = function(feeditem) {
    $scope.currentSelectedHistory_HistoryView = feeditem;
    $scope.bodytext_historyview = feeditem.bodytext;
  }

  $scope.addToFavoritesFromHistoryView = function() {
    $scope.saveArticleToFavorites($scope.currentSelectedHistory_HistoryView.icon, $scope.currentSelectedHistory_HistoryView.relicon, $scope.currentSelectedHistory_HistoryView);
  }

  $scope.addToReadLaterFromHistoryView = function() {
    $scope.saveArticleToReadLater($scope.currentSelectedHistory_HistoryView.icon, $scope.currentSelectedHistory_HistoryView.relicon, $scope.currentSelectedHistory_HistoryView);
  }

  $scope.deleteHistoryItemFromHistoryView = function() {
    $scope.deleteHistoryItem($scope.currentSelectedHistory_HistoryView);
  }

  $scope.clearAllHistoryItems = function() {

  }

  //Saves an feed item to the History Database
  $scope.saveArticleToHistory = function(icon, relicon, article) {
    $scope.app_history_doc = {
      title: article.title,
      icon: icon,
      relicon: relicon,
      content: article.content,
      link: article.link,
      guid: article.guid,
      pubDate: article.pubDate,
      bodytext: article.bodytext
    };

    history.insert($scope.app_history_doc, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      refresh();
    });
  }

  //Saves an feed item to the Favorites Database
  $scope.saveArticleToFavorites = function(icon, relicon, article) {
    $scope.app_favorites_doc = {
      title: article.title,
      icon: icon,
      relicon: relicon,
      content: article.content,
      link: article.link,
      guid: article.guid,
      pubDate: article.pubDate,
      bodytext: article.bodytext
    };

    favorites.insert($scope.app_favorites_doc, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      refresh();
    });
  }

  //Saves an feed item to the ReadLater Database
  $scope.saveArticleToReadLater = function(icon, relicon, article) {
    $scope.app_readlater_doc = {
      title: article.title,
      icon: icon,
      relicon: relicon,
      content: article.content,
      link: article.link,
      guid: article.guid,
      pubDate: article.pubDate,
      bodytext: article.bodytext
    };

    readlater.insert($scope.app_readlater_doc, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      refresh();
    });
  }

  $scope.deleteHistoryItem = function(item) {
    history.remove({ _id: item.item }, {}, function (err, numRemoved) {
      if(err) throw err;
      refresh();
    });
  }

  $scope.deleteFavoriteItem = function(item) {
    favorites.remove({ _id: item.item }, {}, function (err, numRemoved) {
      if(err) throw err;
      refresh();
    });
  }

  $scope.deleteReadLaterItem = function(item) {
    readlater.remove({ _id: item.item }, {}, function (err, numRemoved) {
      if(err) throw err;
      refresh();

    });
  }

  //Deletes the selected My Feed Item
  $scope.deleteMyFeedItem = function(ev, item) {
    var confirm = $mdDialog.confirm()
          .title('Are You Sure You Want To Delete This Feed?')
          .textContent('This Feed will be removed from My Feeds')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel');

    $mdDialog.show(confirm).then(function() {
      feeds.remove({ _id: item._id }, {}, function (err, numRemoved) {
        if(err) throw err;
        refresh();
      });
    }, function() {

    });
  }

  $scope.backToMyFeedsView = function() {
    $scope.IsFeed_MyFeedsViewSelected = false;
    $scope.IsMyFeedsSelected = true;
  }

  ////////////////////////////////////////
  //------FeedList-View-Functions-------//
  ////////////////////////////////////////
  //Toggle The AddCustomFeed SideNav View
  $scope.toggleAddCustomFeed = function() {
    $mdSidenav("rightsidenav_addcustomfeed").toggle();
  }

  //Toggle The AddFeed SideNav View
  $scope.toggleAddFeed = function(feedItem) {
    $mdSidenav("rightsidenav_addfeed").toggle();

    $scope.addfeedItem = feedItem;

  }

  //Sends a request to the webservice that contains a feed that the user entered wanting added to the offical list
  $scope.requestFeed = function(ev) {
    $http.post($scope.webserviceAddress + '/api/requestedfeeds', $scope.addcustomfeedItem).then(function(response) {
        console.log(response);
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(true)
            .title('Feed Request')
            .textContent('Thank You for The Request We will review you submission and deside weather or not the requested feed is vaild and acceptable.')
            .ariaLabel('Feed Request Dialog')
            .ok('Ok')
            .targetEvent(ev)
        );
    });
  }

  //Gets Feed data that the user selected from the feed list and saves it to the local app database
  $scope.addFeedToLocalDatabase = function(feedItem) {
    $scope.app_feeds_doc = {
      name: feedItem.name,
      icon: feedItem.relicon,
      region: feedItem.region,
      category: feedItem.category,
      websiteUrl: feedItem.websiteUrl,
      feedUrl: feedItem.feedUrl
    };

    feeds.insert($scope.app_feeds_doc, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      refresh();
      $mdSidenav("rightsidenav_addfeed").toggle();
    });
  }

  //Gets Feed data that the user entered and saves it to the local app database
  $scope.addCustomFeedToLocalDatabase = function(feedItem) {
    $scope.app_feeds_doc = {
      name: feedItem.name,
      icon: feedItem.icon,
      region: feedItem.region,
      category: feedItem.category,
      websiteUrl: feedItem.websiteUrl,
      feedUrl: feedItem.feedUrl
    };

    feeds.insert($scope.app_feeds_doc, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
      refresh();
      $mdSidenav("rightsidenav_addcustomfeed").toggle();
    });
  }

  ////////////////////////////////////////
  //--Menu/Window-Management-Functions--//
  ////////////////////////////////////////
  //Checks if Layout is Desktop Size (if so return true)
  $scope.desktopScreenSizeMode = function () {
      return $scope.isBiggerScreenSize = $mdMedia('gt-md');
  }

  //Checks if Layout is Mobile Size (if so return true)
  $scope.mobileScreenSizeMode = function () {
      return $scope.isBiggerScreenSize = !$mdMedia('gt-md');
  }

  //MenuBar Actions / Functions
  //File Menu Section Actions & Functions
  $scope.exitApplication = function() {
    BrowserWindow.getFocusedWindow().close();
  }
  //Edit Menu Section Actions & Functions
  //View Menu Section Actions & Functions
  $scope.reloadView = function() {
    BrowserWindow.getFocusedWindow().reload();
  }
  $scope.openDevTools = function() {
    BrowserWindow.getFocusedWindow().webContents.toggleDevTools()
  }
  $scope.setContentToActualSize = function() {
    BrowserWindow.getFocusedWindow().webContents.setZoomLevel(0);
  }
  $scope.zoomContentViewIn = function() {
    $scope.zoomFactor = $scope.zoomFactor + 1;
    BrowserWindow.getFocusedWindow().webContents.setZoomLevel($scope.zoomFactor);
    console.log(zoomFactor);
  }
  $scope.zoomContentViewOut = function() {
    $scope.zoomFactor = $scope.zoomFactor - 1;
    BrowserWindow.getFocusedWindow().webContents.setZoomLevel($scope.zoomFactor);
    console.log($scope.zoomFactor);
  }
  $scope.enterFullScreenMode = function(){
    if($scope.isFullScreenMode == true) {
      BrowserWindow.getFocusedWindow().setFullScreen(false);
      $scope.isFullScreenMode = false;
    } else {
      BrowserWindow.getFocusedWindow().setFullScreen(true);
      $scope.isFullScreenMode = true;
    }
  }
  $scope.changeMainTabViewSelectedIndex = function(index) {
    $scope.selectedIndex = index;
  }

  $scope.changeMainTabViewSelectedIndexInDeskopModeAddOne = function(index) {
    if($scope.isBiggerScreenSize == true) {
    $scope.selectedIndex = index + 2;
    } else {
      $scope.selectedIndex = index;
    }
  }
  //Window Menu Section Actions & Functions
  $scope.minimizeApplication = function() {
    BrowserWindow.getFocusedWindow().minimize();
  }
  $scope.maximizeApplication = function() {
    if($scope.isMaximized == true){
      BrowserWindow.getFocusedWindow().unmaximize()
      $scope.isMaximized = false;
    } else {
      BrowserWindow.getFocusedWindow().maximize()
      $scope.isMaximized = true;
    }
  }
  //Help Menu Section Actions & Functions

});
