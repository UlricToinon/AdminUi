(function(angular){
  angular
    .module('app', ['appServices', 'appControllers', 'ngRoute', 'ngResource'])
    .constant('URLS', {
      BASE_DEV : 'http://localhost:3000/api',
      BASE_PROD : 'http://api.modelabs.com/api/sites/mmob'
    })
    .constant('ENV', 'production')
    .config(['$routeProvider', '$httpProvider',
      function($routeProvider, $httpProvider){

        $routeProvider.
          when('/', {
            templateUrl: 'assets/templates/home.html',
            controller: 'HomeCtrl'
          }).
          when('/signin', {
            templateUrl: 'assets/templates/signin.html',
            controller: 'SigninCtrl',
            publicAccess: true
          }).
          // when('/admin', {
          //   templateUrl: 'assets/templates/admin.html'
          // }).
          otherwise({redirectTo: '/'});
      }
    ])
    .run(function($rootScope, $location, apiService, $route) {
      var routesOpenToPublic = [];
      angular.forEach($route.routes, function(route, path) {
          // push route onto routesOpenToPublic if it has a truthy publicAccess value
          route.publicAccess && (routesOpenToPublic.push(path));
      });

      $rootScope.$on('$routeChangeStart', function(event, nextLoc, currentLoc) {
          var closedToPublic = (-1 === routesOpenToPublic.indexOf($location.path()));
          if(closedToPublic && !apiService.auth.isAuthenticate()) {
              $location.path('/signin');
          }
      });
    });
})(window.angular)