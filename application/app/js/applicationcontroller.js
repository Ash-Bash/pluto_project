const {BrowserWindow} = require('electron').remote;
var remote = require('electron').remote;

angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

.controller('ApplicationController', function($mdMedia, $timeout, $mdSidenav, $mdDialog, $mdUtil, $scope, $http) {
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
  $scope.addfeedItem = "";
  $scope.addcustomfeedItem = "";

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

          //console.log("Feeds: " +  JSON.stringify($scope.newsfeeds));
      });
  };

  // Refresh WebPage
  refresh();

  //FeedList View Functions
  $scope.toggleAddCustomFeed = function() {
    $mdSidenav("rightsidenav_addcustomfeed").toggle();
  }

  $scope.toggleAddFeed = function(feedItem) {
    $mdSidenav("rightsidenav_addfeed").toggle();

    $scope.addfeedItem = feedItem;
  }

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

  $scope.showAlert = function(ev) {
    // Appending dialog to document.body to cover sidenav in docs app
    // Modal dialogs should fully cover application
    // to prevent interaction outside of dialog
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('This is an alert title')
        .textContent('You can specify some description text in here.')
        .ariaLabel('Alert Dialog Demo')
        .ok('Got it!')
        .targetEvent(ev)
    );
  };

  function buildToggler(navID) {
    var debounceFn = $mdUtil.debounce(function () {
        $mdSidenav(navID)
            .toggle()
    }, 100);
    return debounceFn;
  }

  $scope.desktopScreenSizeMode = function () {
      return $scope.isBiggerScreenSize = $mdMedia('gt-md');
  }

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

  function DialogController($scope, $mdDialog) {
    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };
  }
});
