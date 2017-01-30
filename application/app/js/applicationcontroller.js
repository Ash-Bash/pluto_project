////////////////////////////////////////////////////////
//-----------------Dependencies-Section---------------//
////////////////////////////////////////////////////////
const {BrowserWindow} = require('electron').remote;
var remote = require('electron').remote;
const Datastore = require('nedb');

////////////////////////////////////////////////////////
//----------------Local-Database-Section--------------//
////////////////////////////////////////////////////////

//Initilizing Databases
db = {};
db.feeds = new Datastore({ filename: 'app/database/app_feeds.db', autoload: true });
db.favorites = new Datastore({ filename: 'app/database/app_favorites.db', autoload: true });
db.readlater = new Datastore({ filename: 'app/database/app_readlater.db', autoload: true });
db.history = new Datastore({ filename: 'app/database/app_history.db', autoload: true });

//Loading Databases Into Memory
// load each database (here we do it asynchronously)
db.feeds.loadDatabase(function (err) {    // Callback is optional
// Now commands will be executed
});
db.favorites.loadDatabase(function (err) {    // Callback is optional
// Now commands will be executed
});
db.readlater.loadDatabase(function (err) {    // Callback is optional
// Now commands will be executed
});
db.history.loadDatabase(function (err) {    // Callback is optional
// Now commands will be executed
});

////////////////////////////////////////////////////////
//------------AngularJS-Controllers-Section-----------//
////////////////////////////////////////////////////////

angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

//Main Application AngularJS Controller
.controller('ApplicationController', function($mdMedia, $timeout, $mdSidenav, $mdDialog, $mdUtil, $scope, $http) {

  //AngularJS / $scope Variables
  $scope.webserviceAddress = "http://192.168.1.10:2000";
  $scope.isMobile = true;
  $scope.isTablet = false;
  $scope.isDesktop = false;
  $scope.isBiggerScreenSize = false;
  $scope.isFullScreenMode = false;
  $scope.isMaximized = false;

  $scope.zoomFactor = 0;
  
  $scope.selectedIndex = 0;

  $scope.newsfeeds = "";
  $scope.feed = "";

  // Database Document Objects
  $scope.app_feeds_doc = {};
  $scope.app_favorites_doc = {};
  $scope.app_readlater_doc = {};
  $scope.app_history_doc = {};

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

    db.feeds.insert($scope.app_feeds_doc, function (err, newDoc) {   // Callback is optional
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
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
