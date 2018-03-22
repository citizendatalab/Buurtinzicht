angular.module('app.controllers')

.controller('DetailController', function($scope, $rootScope, $state, detailData, DashboardService) {
  $rootScope.details = detailData.data;
  if(detailData.data.markers == true){
    $rootScope.addMarkers(detailData.data);
  }
  /*if(detailData.data['areas'][0]['values'].length <= 1){
          console.log('Er is maar data van 1 jaar beschikbaar');
          var areas = $state.params.areas;
           $state.go('dashboard.cards', {
            theme: $rootScope.selectedTheme,
            areas: areas,
          });
          $scope.selectArea(areas);
    }*/
  // Return to the cards overview based on current state params and remove any compared areas
  $scope.goToReturn = function() {
    $rootScope.removeMarkers();
    if (!$rootScope.selectedTheme) {
      $rootScope.selectedTheme = 'BW'
    }

    var areas = $state.params.areas;

    $state.go('dashboard.cards', {
      theme: $rootScope.selectedTheme,
      areas: areas,
    });
    $scope.selectArea(areas);
  };

});
