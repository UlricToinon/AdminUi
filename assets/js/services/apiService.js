(function(angular){

  angular.module('appServices')
    .factory('apiService', [
      '$http',
      'URLS',
      'ENV',
      'storageService',
      function($http, URLS, ENV, storageService){
        var baseUrl = URLS.BASE_DEV
        if (ENV === 'production') {baseUrl = URLS.BASE_PROD};

        var authStore = storageService.get('auth');
        if (authStore === null){
          storageService.register('auth', {});
        }
        authStore = storageService.get('auth');

        var metaStore = storageService.get('metas');
        if (metaStore === null){
          storageService.register('metas', {});
        }
        metaStore = storageService.get('metas');

        function _isAuthenticate(){
          var meta = metaStore.get('auth');

          // Check if the current user is authenticate since 60 mins
          if(meta === null || Math.round((new Date().getTime() - meta) / 1000 / 60) > 60){
            return false;
          } else{
            if (authStore.token !== null){
              return true;
            } else {
              return false;
            }
          }
        }
        


        //TODO: Private general method to GET/POST/PUT/DELETE with API


        // Public function
        return {
          auth: {
            signin: function(data, success, errors){
              if(!_isAuthenticate()){
                $http.post(baseUrl + '/auth/login', data)
                  .then(function(response){
                    metaStore.set('auth', new Date().getTime());
                    success(response.data.token);
                  }, function(responseError){
                    errors(responseError);
                  });
              } else{
                success(storageService.get('auth'));
              }
            },
            logout: function(success){
              delete storageService.get('auth').token
              success();
            },
            isAuthenticate: function(){
              return _isAuthenticate();
            }
          },
          models: {
            get: function(success, error){
              $http.get('./assets/datas/templates.json').then(
                function(response){
                  success(response.data);
                }, function(responseError){
                  error(responseError);
                }
              );
            },
            getOne: function(name, success, errors){
              $http.get('./assets/datas/templates/' + name).success(success(response)).errors(errors());
            }
          }
        }
      }
    ]);

})(window.angular)