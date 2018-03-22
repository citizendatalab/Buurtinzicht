angular.module('app.services')

.factory('DashboardService', function($rootScope, $http, $stateParams) {

  var factory = { }

  factory.areaById = function(id) {
    return $http
      .get('api/list/areas/id/' + id)
      .success(function(response) {
        return response;
      });
  };

  factory.areasByCode = function(areas) {
    return $http
      .get('api/list/areas/code/' + areas)
      .success(function(response) {
        return response;
      });
  };

  factory.areaByLevel = function(level) {
    return $http
      .get('api/list/areas/level/' + level)
      .success(function(response) {
        return response;
      });
  };

  factory.valuesByCards = function(params) {
    return $http
      .get('api/list/values/cards', { params: params })
      .success(function(response) {
        return response;
      });
  };

  factory.valuesByDetail = function(params) {
    return $http
      .get('api/list/values/detail/', { params : params })
      .success(function(response) {
        return response;
      });
  };

  return factory;
});
