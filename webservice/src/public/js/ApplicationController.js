angular.module('BlankApp',['ngMaterial', 'ngMdIcons'])

.controller('ApplicationController',  ['$scope', '$http', function($scope, $http) {
  console.log("Hello World from StationsListController");


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

}]);
