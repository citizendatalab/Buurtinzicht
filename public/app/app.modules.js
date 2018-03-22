angular.module('app', [
  'app.routes',
  'app.controllers',
  'app.services',
  'app.directives'
])

angular.module('app.routes', [
  'ui.router'
])

angular.module('app.controllers', [])

angular.module('app.services', [])

angular.module('app.directives', ['d3'])

.run(function($rootScope) {
  $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
    $rootScope.previousState = from.name;
    $rootScope.currentState = to.name;
  });

});
