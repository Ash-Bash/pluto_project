const {BrowserWindow} = require('electron').remote;
var remote = require('electron').remote;

angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

.controller('ApplicationController', function($mdMedia, $scope) {
  $scope.isMobile = true;
  $scope.isTablet = false;
  $scope.isDesktop = false;
  $scope.isBiggerScreenSize = false;
  $scope.isFullScreenMode = false;
  $scope.isMaximized = false;

  $scope.zoomFactor = 0;

  $scope.selectedIndex = 0;

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
});
