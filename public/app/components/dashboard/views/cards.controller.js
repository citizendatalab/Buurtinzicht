angular.module('app.controllers')

.controller('CardsController', function($scope, $rootScope, $state) {
  // $rootScope.cards = cardsData.data;

  $scope.blockColor = function(index) {
    return {
      'background-color': $rootScope.compareColors[index]
    }
  }

  $scope.$watch('cards', function() {
    var areas = $state.params.areas.split(',')
    if (areas.length > 0) { var columnCount = areas.length; }
    else { var columnCount = 0; }

    $scope.columns = {
      '-webkit-columns': 100 * columnCount + 50 + 'px', /* Chrome, Safari, Opera */
         '-moz-columns': 100 * columnCount + 50 + 'px', /* Firefox */
              'columns': 100 * columnCount + 50 + 'px',
    }
  });


});
