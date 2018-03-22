angular.module('app.routes')

.config(function($stateProvider, $locationProvider, $urlRouterProvider) {

  $stateProvider

  .state('dashboard', {
    url: '/',
    abstract: true,
    templateUrl: 'app/components/dashboard/dashboard.view.html',
    controller: 'DashboardController',
  })

  .state('dashboard.cards', {
    url: 'cards/:theme/:areas',
    templateUrl: 'app/components/dashboard/views/cards.view.html',
    controller: 'CardsController'
  })
  .state('dashboard.detail', {
    url: 'details/:var/:areas',
    templateUrl: 'app/components/dashboard/views/detail.view.html',
    controller: 'DetailController',
    resolve: {
      detailData: function($stateParams, DashboardService) {
        return DashboardService.valuesByDetail($stateParams);
      }
    }
  })

  .state('widgetVariable', {
      url: '/widget/variable',
      templateUrl: 'app/components/shared/widget/variable.view.html',
      controller: 'WidgetController',
      resolve: {
        widgetParams : function($location) {
          return $location.search();
        },
        widgetData: function($location, WidgetService) {
          return WidgetService.variable($location.search())
        }
      }
  })

  .state('widgetGroup', {
      url: '/widget/group',
      templateUrl: 'app/components/shared/widget/group.view.html',
      controller: 'WidgetController',
      resolve: {
        widgetParams : function($location) {
          return $location.search();
        },
        widgetData: function($location, WidgetService) {
          return WidgetService.group($location.search())
        }
      }
  })

  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/cards/BW/');
});
