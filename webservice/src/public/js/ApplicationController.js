angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

.controller('ApplicationController',  ['$scope', '$http', function($scope, $http) {
  console.log("Hello World from StationsListController");

  //Declared Vars
  $scope.batchFileUrl = "";
  $scope.jsonBatchData = [];

  // HTTP Get Requests
  // Gets StationsList Database
  var refresh = function() {
      $http.get('/api/newsfeeds').success(function(response) {
          console.log("I got My Data I Requested");
          $scope.newsfeeds = response;
          $scope.feed = "";
      });
  };

  // Refresh WebPage
  refresh();

  // Functions
  // Adds A Station To The Station Database
  $scope.addFeed = function() {
      console.log($scope.feed);
      $http.post('/api/newsfeeds', $scope.feed).success(function(response) {
          console.log(response);
          // Refresh WebPage
          refresh();
      });
  }
  // Updates A Station To The Database
  $scope.updateFeed = function() {
      console.log($scope.feed._id);
      $http.put('/api/newsfeeds/' + $scope.feed._id, $scope.feed).success(function(response) {
          console.log(response);
          // Refresh WebPage
          refresh();
      });
  }
  // Edits A Station From The Database
  $scope.editFeed = function(id) {
      console.log(id);
      $http.get('/api/newsfeeds/' + id).success(function(response){
          $scope.feed = response;
      });
  }
  // Deletes A Station From The Station Database
  $scope.deleteFeed = function(id) {
      console.log(id);
      $http.delete('/api/newsfeeds/' + id).success(function(response) {
          console.log(response);
          // Refresh WebPage
          refresh();
      });
  }

  $scope.openBatchFile = function(openFileDialog) {
    //document.getElementById(openFileDialog).click();
  }

  $scope.batchFileDir = function() {
    $scope.batchFileUrl = document.getElementById('openFileDialog').files[0];
    $scope.viewBatchFile;
  }

  $scope.viewBatchFile = function() {
    var reader = new FileReader();

    // Read file into memory as UTF-16
    reader.readAsText(document.getElementById('openFileDialog').files[0], "UTF-8");

    // Handle progress, success, and errors
    reader.onprogress = $scope.batchFileInProgress;
    reader.onload = $scope.batchFileLoaded;
    reader.onerror = $scope.batchFileErrorHandler;
  }

  $scope.batchFileInProgress = function(evt) {
    if (evt.lengthComputable) {
      // evt.loaded and evt.total are ProgressEvent properties
      var loaded = (evt.loaded / evt.total);
      if (loaded < 1) {
        // Increase the prog bar length
        // style.width = (loaded * 200) + "px";
      }
    }
  }

  $scope.batchFileLoaded = function(evt) {
    // Obtain the read file data
    var fileString = evt.target.result;
    $scope.jsonBatchData = $.parseJSON(fileString);
    $('#jsonViewer').text(fileString);
    console.log($scope.jsonBatchData);

    // Handle UTF-16 file dump
    if(utils.regexp.isChinese(fileString)) {
      //Chinese Characters + Name validation
    }
    else {
      // run other charset test
    }
  }

  $scope.batchFileErrorHandler = function(evt) {
    if(evt.target.error.name == "NotReadableError") {
      // The file could not be read
    }
  }

  $scope.uploadBatchFile = function() {
    $.get($scope.batchFileUrl.replace("c://", ""), function(data) {
      //$('#jsonViewer').text($.parseJSON( data ) );
      console.log( $.parseJSON( data ) );
    });
  }

}]);
