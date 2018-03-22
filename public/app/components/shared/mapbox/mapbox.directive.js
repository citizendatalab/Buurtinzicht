angular.module('app.directives')

.directive('mapbox', [
  function () {
    return {
      restrict: 'EA',
      replace: true,
      scope: {
        callback: "="
      },
      link: function (scope, element, attributes) {
        L.mapbox.accessToken = 'pk.eyJ1Ijoid291dGVybWUiLCJhIjoiY2l1cW5nZDJ6MDAwaDMzcG9pN2E4ZnB3cyJ9.gA0rMT1m4y3iD7D77GS3NA';

        var map = L.mapbox.map(element[0], "mapbox.light", {
          attributionControl: false,
          minZoom: 10,
        });

        // var map = L.mapbox.map(element[0]);
        //
        // L.mapbox.styleLayer('mapbox://styles/wouterme/civl3oem800me2io7fsfiy6es').addTo(map);

        scope.callback(map);
      }
    };
  }
]);
