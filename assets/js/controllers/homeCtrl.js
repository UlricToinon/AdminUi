(function(angular){
  angular.module('appControllers').controller('HomeCtrl', [
    '$scope',
    'storageService',
    'apiService',
    HomeCtrl
  ]).directive('template-loader', function(scope, element){

  });

  function HomeCtrl ($scope, storageService, apiService){
    'use strict';
    $scope.models = '';

    $scope.getModels = function(){
      apiService.models.get(
        function(response){
          $scope.models = response;
        },
        function(error){  
          alert('Une erreur est survenue');
          $scope.models = '';
        }
      );
    }

    $scope.loadModel = function(){
      $scope.templatePath = $scope.item.path;
    }

    // Execute this to get all update models
    $scope.getModels();
  }
})(window.angular)