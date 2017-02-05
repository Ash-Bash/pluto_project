angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

.controller('ApplicationController',  ['$scope', '$http', function($scope, $http) {
  console.log("Hello World from ApplicationController");

  //Declared Vars
  $scope.dsnIP = "http://192.168.1.10";
  $scope.determinateBatchFileValue = 0;
  $scope.batchFileUrl = "";
  $scope.jsonBatchData = [];

  // HTTP Get Requests
  // Gets Newsfeeds Database
  var refresh = function() {
      $http.get('/api/newsfeeds').success(function(response) {
          console.log("I got My Data I Requested");
          $scope.newsfeeds = response;
          $scope.feed = "";
      });
      $http.get('/api/requestedfeeds').success(function(response) {
          console.log("I got My Data I Requested");
          $scope.requestedfeeds = response;
          $scope.requestedfeed = "";
      });
      $http.get('/api/approvedfeeds').success(function(response) {
          console.log("I got My Data I Requested");
          $scope.approvedfeeds = response;
          $scope.approvedfeed = "";
      });
  };

  // Refresh WebPage
  refresh();

  // Functions
  //Newsfeeds Section
  // Adds A Newsfeed To The Newsfeed Database
  $scope.addFeed = function() {
      console.log($scope.feed);
      $http.post('/api/newsfeeds', $scope.feed).success(function(response) {
          console.log(response);
          // Refresh WebPage
          refresh();
      });
  }
  // Updates A Newsfeed To The Database
  $scope.updateFeed = function() {
      console.log($scope.feed._id);
      $http.put('/api/newsfeeds/' + $scope.feed._id, $scope.feed).success(function(response) {
          console.log(response);
          // Refresh WebPage
          refresh();
      });
  }
  // Edits A Newsfeed From The Database
  $scope.editFeed = function(id) {
      console.log(id);
      $http.get('/api/newsfeeds/' + id).success(function(response){
          $scope.feed = response;
      });
  }
  // Deletes A Newsfeed From The Station Database
  $scope.deleteFeed = function(id) {
      console.log(id);
      $http.delete('/api/newsfeeds/' + id).success(function(response) {
          console.log(response);
          // Refresh WebPage
          refresh();
      });
  }

  //Requested Feeds Section
  $scope.approveRequestedFeed = function(id) {
    console.log(id);
    $http.get('/api/requestedfeeds/' + id).success(function(response){
        $scope.requestedfeed = response;

        $http.post('/api/approvedfeeds', $scope.requestedfeed).success(function(response) {
            console.log(response);
            refresh();
            $http.delete('/api/requestedfeeds/' + id).success(function(response) {
                console.log(response);
                // Refresh WebPage
                refresh();
            });
        });
    });

  }

  $scope.denyRequestedFeed = function(id) {
    console.log(id);
    $http.delete('/api/requestedfeeds/' + id).success(function(response) {
        console.log(response);
        // Refresh WebPage
        refresh();
    });
  }

  //Approved Feeds Section
  $scope.addApprovedFeed = function() {
    console.log($scope.approvedfeed);
    $http.post('/api/newsfeeds', $scope.approvedfeed).success(function(response) {
        console.log(response);
        refresh();
        $http.delete('/api/approvedfeeds/' + $scope.approvedfeed._id).success(function(response) {
            console.log(response);
            // Refresh WebPage
            refresh();
        });
    });
  }

  $scope.amendApprovedFeed = function() {
    console.log($scope.approvedfeed._id);
    $http.put('/api/approvedfeeds/' + $scope.approvedfeed._id, $scope.approvedfeed).success(function(response) {
        console.log(response);
        // Refresh WebPage
        refresh();
    });
  }

  $scope.reviewApprovedFeed = function(id) {
    console.log(id);
    $http.get('/api/approvedfeeds/' + id).success(function(response){
        $scope.approvedfeed = response;
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
  }

  $scope.batchFileErrorHandler = function(evt) {
    if(evt.target.error.name == "NotReadableError") {
      // The file could not be read
    }
  }

  $scope.uploadBatchFile = function() {
    //Loops jsonBatchData to colleced and save each feed item
    for (i in $scope.jsonBatchData){
      var obj = $scope.jsonBatchData[i];
      console.log("Feed: " + obj);

      //Saves each feed to the newsfeeds entity in the Database
      $http.post('/api/newsfeeds', obj).success(function(response) {
          console.log(response);
      });

      // Renders the progress bar's value
      if ($scope.determinateBatchFileValue < 100) {
        $scope.determinateBatchFileValue = (i / $scope.jsonBatchData.length) * 100;
      } else {
        $scope.determinateBatchFileValue = 0;
      }

      //Checks if batching process has be complete if so refresh()
      if(i == $scope.jsonBatchData.length - 1){
        refresh();
      }
    }
  }

}]);
