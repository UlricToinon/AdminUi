(function (angular) {
  "use strict";

  angular.module('appServices')
    .factory('storageService', ['$window', function($window) {
      function _forEach(obj, callback, args) {
          var value, i = 0,
              length = obj.length,
              isArray = _isArrayLike(obj);

          if (args) {
              if (isArray) {
                  for (; i < length; i++) {
                      value = callback.apply(obj[i], args);

                      if (value === false) {
                          break;
                      }
                  }
              } else {
                  for (i in obj) {
                      value = callback.apply(obj[i], args);

                      if (value === false) {
                          break;
                      }
                  }
              }

              // A special, fast, case for the most common use of each
          } else {
              if (isArray) {
                  for (; i < length; i++) {
                      value = callback.call(obj[i], i, obj[i]);

                      if (value === false) {
                          break;
                      }
                  }
              } else {
                  for (i in obj) {
                      value = callback.call(obj[i], i, obj[i]);

                      if (value === false) {
                          break;
                      }
                  }
              }
          }

          return obj;
      }

      var _engine,
          _cache = {},
          _stores = {},
          _logPrefix = '[STORAGE]',
          _defaultStore = {
              meta: {
                  created_on: null,
                  ttl: 0,
                  remote: {
                      source: '',
                      sourceType: 'json'
                  }
              },
              exists: function (key) {
                  if (!_cache[this.label].hasOwnProperty(key)) {
                      var store = JSON.parse(
                          _engine.getItem(this.label)
                      );
                      if (!store.hasOwnProperty(key)) {
                          return false;
                      } else {
                          _cache[this.label][key] = store[key];
                      }
                  } else {
                      return true;
                  }
              },
              getAll: function (refresh) {
                  if (refresh === true) {
                      var rawData = _engine.getItem(this.label);
                      _cache[this.label] = JSON.parse(rawData);
                  }
                  return _cache[this.label];
              },
              get: function (key) {
                  if (!_cache[this.label].hasOwnProperty(key)) {
                      var store = JSON.parse(_engine.getItem(this.label));
                      if (!store.hasOwnProperty(key)) {
                          return null;
                      } else {
                          _cache[this.label][key] = store[key];
                          return store[key];
                      }
                  } else {
                      return _cache[this.label][key];
                  }
              },
              set: function (key, value, options) {
                  var store = JSON.parse(
                      _engine.getItem(this.label)
                  );
                  store[key] = value;

                  if (typeof options !== 'object') {
                      options = {}; // NOT USED YET
                  }

                  _engine.removeItem(this.label);
                  _engine.setItem(
                      this.label,
                      JSON.stringify(store)
                  );
                  _cache[this.label][key] = value;
                  return true;
              },
              delete: function (key) {
                  var store = JSON.parse(
                      _engine.getItem(this.label)
                  );
                  if (store.hasOwnProperty(key)) {
                      var oldValue = store[key];
                      delete store[key];
                      _engine.removeItem(this.label);
                      _engine.setItem(
                          this.label,
                          JSON.stringify(store)
                      );
                      if (_cache[this.label].hasOwnProperty(key)) {
                          delete _cache[this.label][key];
                      }
                  }
                  return false;
              },
              each: function (callback, persistChanges) {
                  var store = JSON.parse(
                      _engine.getItem(this.label)
                  );
                  _forEach(
                      store,
                      function (value, index) {
                          if (typeof callback === 'function') {
                              callback(value, index);
                          }
                      }
                  );
                  if (persistChanges === true) {
                      // if (_engine.set(this.label, store)) {
                        //this.changed.dispatch(this, key, oldValue, value);
                      // }
                  } else {
                      return store;
                  }
              },
              filter: function (callback, format) {
                  var result,
                      store = JSON.parse(
                          _engine.getItem(this.label)
                      );
                  if (typeof format === 'undefined') {
                      format = 'object';
                  }
                  if (format === 'object') {
                      result = {};
                  } else if (format === 'array') {
                      result = [];
                  }
                  _forEach(
                      store,
                      function (key, value) {
                          if (callback(value, key) === true) {
                              if (format === 'object') {
                                  result[key] = value;
                              } else if (format === 'array') {
                                  result.push(value);
                              }
                          }
                      }
                  );
                  return result;
              },
              clear: function () { // Delete all data (from THIS store) permanently
                  _engine.removeItem(this.label);
                  _engine.setItem(
                      this.label,
                      '{}'
                  );
                  _cache[this.label] = {};
              },
              used: function () {
                  return _engine.getItem(this.label).length
              }
          };

      function _isAvailable () {
          var test = '__localStorage-test';
          try {
              window.localStorage.setItem(test, test);
              window.localStorage.removeItem(test);
              return true;
          } catch(e) {
              return false;
          }
      }

      // Setup storage if possible
      if (_isAvailable()) {
          _engine = window.localStorage;
      }

      // Pubic API
      return {
          isAvailable: function () {
              return _isAvailable();
          },
          count: function () {
              return _stores.length;
          },
          exists: function (label) {
              return (_isAvailable() && _stores.hasOwnProperty(label));
          },
          register: function (label, options) { // Registers a new store
              // Can't replace an existing store
              if (this.exists(label)) {
                  return false;
              }

              if (typeof options !== 'object') {
                  options = {};
              }

              if (label !== '') {
                  var store = window.angular.extend({ }, _defaultStore);
                  _stores[label] = window.angular.extend(store, options);
                  _stores[label].label = label;

                  // Try to retrieve existing data
                  var rawData = _engine.getItem(label);
                  if (rawData === null) {
                      _engine.setItem(label, '{}');
                      _cache[label] = {};
                  } else {
                      _cache[label] = JSON.parse(rawData);
                  }
                  return true;
              }
              return false;
          },
          get: function (label) {
              if (_isAvailable()) {
                  return (this.exists(label)) ? _stores[label] : null;
              } else {
                  return null;
              }
          },
          delete: function (label) {
              if (_isAvailable()) {
                  if (_stores.hasOwnProperty(label)) {
                      delete _stores[label];
                      _engine.removeItem(label);
                  }
              }
          },
          clearAll: function() { // Delete all data (from ALL stores) permanently
              if (_isAvailable()) {
                  for (var i = _stores.length - 1; i >= 0; i--) {
                      _engine.removeItem(i);
                      _engine.setItem(i, '{}');
                  };
              }
          }
      };
  }]);
}(window.angular));