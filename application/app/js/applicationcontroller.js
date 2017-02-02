////////////////////////////////////////////////////////
//-----------------Dependencies-Section---------------//
////////////////////////////////////////////////////////
const {BrowserWindow} = require('electron').remote;
var remote = require('electron').remote;
var Datastore = require('nedb');

////////////////////////////////////////////////////////
//------------AngularJS-Controllers-Section-----------//
////////////////////////////////////////////////////////

angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

.factory('FeedService',['$http',function($http){
    return {
        parseFeed : function(url){
            return $http.jsonp('//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=15&callback=JSON_CALLBACK&q=' + encodeURIComponent(url));
        }
      }
}])

//Main Application AngularJS Controller
.controller('ApplicationController', function($mdMedia, $timeout, $mdSidenav, $mdDialog, $mdUtil, $scope, $http, FeedService) {

  //AngularJS / $scope Variables
  $scope.webserviceAddress = "http://192.168.1.10:2000";
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
      });
      favorites.loadDatabase(function (err) {    // Callback is optional
      // Now commands will be executed
      });
      readlater.loadDatabase(function (err) {    // Callback is optional
      // Now commands will be executed
      });
      history.loadDatabase(function (err) {    // Callback is optional
      // Now commands will be executed
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
    }
    console.log($scope.app_feeds_data);
  }

  function loadRSSData(feed) {
    /*$http.get(feed.feedUrl).then(function (data) {
      $scope.rssFeedData = data.query.rss;
      console.log($scope.rssFeedData);
    });*/
    /*FeedService.parseFeed(feed.feedUrl).then(function (res) {
        $scope.rssFeedData = res.data.responseData.feed.entries;
        console.log($scope.rssFeedData);
    });*/
    $http.get(" https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(feed.feedUrl) + "&api_key=snrqeovk88j7lybilkvxtfif9muzebeaq3ojlyid")
            .then(function(data) {
                $scope.rssFeedData = data;
                console.log($scope.rssFeedData);
    });
    //'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20\'' + encodeURIComponent(feed.feedUrl) + '\'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=JSON_CALLBACK'
    /*$http({
        url: 'https://api.rss2json.com/v1/api.json',
       method: 'GET',
       dataType: 'json',
        data: {
            rss_url: 'https://news.ycombinator.com/rss'
        }
    }).then(function(data) {
        $scope.rssFeedData = data;
        console.log($scope.rssFeedData);
    });*/

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
      refresh();
    } else if (id == "My_Feeds") {
      $scope.IsAllNewsHomeViewSelected = false;
      $scope.IsMyFeedsHomeViewSelected = true;
      $scope.IsFeed_HomeViewSelected = false;
      refresh();
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
        loadRSSData(feed);
        $scope.IsFeed_HomeViewSelected = true;
        $scope.IsAllNewsHomeViewSelected = false;
        $scope.IsMyFeedsHomeViewSelected = false;
      }
    } else if (ishomeview == false) {
      if ($scope.IsFeed_MyFeedsViewSelected == true) {
        $scope.IsFeed_MyFeedsViewSelected = false;
        $scope.IsMyFeedsSelected = true;
      } else if ($scope.IsFeed_MyFeedsViewSelected == false) {
        loadRSSData(feed);
        $scope.IsFeed_MyFeedsViewSelected = true;
        $scope.IsMyFeedsSelected = false;
      }
    }
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

  ////////////////////////////////////////
  //---Favorites-Splitview-Functions----//
  ////////////////////////////////////////
  //Allows Views in the Favorites SplitView Section to be hidden or shown id IsFavoritesSelected is true or false
  $scope.viewFavoritesSections = function(id) {
    if(id == "Favorites") {
      $scope.IsFavoritesSelected = true;
      refresh();
    } else if (id == "Read_Later") {
      $scope.IsFavoritesSelected = false;
      refresh();
    }
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

    db.feeds.insert($scope.app_feeds_doc, function (err, newDoc) {   // Callback is optional
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
