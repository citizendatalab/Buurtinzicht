angular.module('app.services')

.factory('WidgetService', function($http, $stateParams) {

  var factory = { }

  factory.variable = function(data) {
    return $http
      .get('api/widget/variable', { params: data })
      .then(function(response) {
        return response.data;
      });
  };

  factory.group = function(data) {
    return $http
      .get('api/widget/group', { params: data })
      .then(function(response) {
        return response.data;
      });
  };

  factory.submitFeedback = function(data) {
    return $http
      .post('api/widget/submitFeedback', data)
      .then(function(response) {
        return response.data;
      })
  }

  return factory;
});
