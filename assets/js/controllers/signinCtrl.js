(function(angular){
  angular.module('appControllers').controller('SigninCtrl', [
    '$scope',
    '$location',
    'storageService',
    'apiService',
    SigninCtrl
  ]);

  function SigninCtrl ($scope, $location, storageService, apiService){
    'use strict';
    $scope.email = '';
    $scope.password = '';

    $scope.checkIfAuth = function(){
      if (apiService.auth.isAuthenticate()){
        $location.path('/');
        $scope.$apply();
      }
    }
    $scope.login = function (){
      var payload = {
        email: $scope.email,
        password: $scope.password
      }

      var authStorage = storageService.get('auth');
      if (authStorage === null){
        storageService.register('auth', {});
      }
      authStorage = storageService.get('auth');


      apiService.auth.signin(
        payload,
        function(token){
          authStorage.set('token', token);
          $location.path('/');
          $scope.$apply();
        }, function(){
          alert('Une erreur est survenue !');
        }
      );
    }

    $scope.checkIfAuth();

  }
})(window.angular)