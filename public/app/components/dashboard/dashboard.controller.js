angular.module('app.controllers')

.controller('DashboardController', function($scope, $rootScope, $state, $timeout, $location, DashboardService) {

  $scope.showWelcome = true;

  // Set Themes
  $scope.themes = [
    {'name': 'Bewoners en Wonen', 'short': 'BW'},
    {'name': 'Onderwijs en Economie', 'short': 'OE'},
    {'name': 'Ruimte en Sociaal', 'short': 'RS'},
    {'name': 'Leefbaarheid en Veiligheid', 'short': 'LV'},
    {'name': 'Energie', 'short': 'EN'},
    {'name': 'Sociale Media', 'short': 'SM'}
  ];
  $rootScope.selectedTheme = $scope.themes[0].short;

  // Set colors
  $rootScope.compareColors = [
    '#ED2845', '#2681B4', '#33C2CC', '#08A087', '#399B0B'
  ];

  // Set vars
  $scope.varData = '';
  $scope.values = {}
  $rootScope.compareSelection = false;
  $rootScope.compare = [];



  $scope.compareActive = function() {
    if ($rootScope.compareSelection) {
      return {
        'color': '#fff',
        'background-color': '#ED2845'
      }
    }
  }

  // Select theme function
  $scope.selectTheme = function(theme) {
     $scope.markerLayer.clearLayers();
    $rootScope.selectedTheme = theme.short;
    $state.go($state.current.name, {theme: theme}, {notify: false});
    
    $scope.selectArea($state.params.areas);
  };

  // Select area and retrieve data matching subview
  $scope.selectArea = function(areas) {
    if(areas.length == 0){
      console.log('Geen gebied geselecteerd')
    }
    else{
      $scope.showWelcome = false;
      if (typeof areas === 'string') {
        var areas = areas.split(',')
      }

      DashboardService
        .areasByCode(areas)
        .success(function(response) {
          var sortedArray = [];

          // Add the remaining area's in the correct order to the new array
          for (var i = 0; i < areas.length; i++) {
            var compareIndex = response.map(function(d) { return d['code']; }).indexOf(areas[i]);
            sortedArray.push(response[compareIndex])
          }
          $rootScope.compare = sortedArray

          $state.params.areas = areas.toString();
          if ($state.params.theme) {
            DashboardService.valuesByCards($state.params).success(function(response) {
              $rootScope.cards = response;
              $rootScope.details = [];

              if (areas.length > 0) { var columnCount = areas.length; }
              else { var columnCount = 0; }

              $scope.columns = {
                '-webkit-columns': 100 * columnCount + 50 + 'px', /* Chrome, Safari, Opera */
                   '-moz-columns': 100 * columnCount + 50 + 'px', /* Firefox */
                        'columns': 100 * columnCount + 50 + 'px',
              }
            });
          }
          if ($state.params.var) {
            DashboardService.valuesByDetail($state.params).success(function(response) {
                      
            //ADD markers if they are available
             $rootScope.removeMarkers()
              
              if(response.markers == true){
                $rootScope.addMarkers(response)
              }
              /*if(response['areas'][0]['values'].length <= 1){
                   console.log('Er is maar data van 1 jaar beschikbaar');
                   
              };*/

              $rootScope.details = response;
              $rootScope.cards = [];
            });
          }

        })
    };
  }

  $rootScope.removeMarkers = function(data) {
       $scope.markerLayer.clearLayers();

  }

  $rootScope.addMarkers = function(data) {

     angular.forEach(data.markerData, function(value, key){
       angular.forEach(value.values, function(markerInfo, key2){
         var marker = L.circleMarker([markerInfo.lat, markerInfo.lng],{radius:10, color:'black',fillColor:$rootScope.compareColors[checkCompare(value.areacode)]})
         $scope.markerLayer.addLayer(marker)
       });
    });
  }

  // Set compare mode to true to enable selection
  $scope.addCompare = function() {
    $rootScope.compareSelection = true;
  }

  // Remove item from compare list
  $scope.removeCompare = function(data) {
    var areas = $state.params.areas.split(',')
    var compareIndex = areas.map(function(d) { return d }).indexOf(data);
    areas.splice(compareIndex, 1);
    $state.go($state.current.name, {areas: areas.toString()}, {notify: false});

    if(areas.length === 0){
      $rootScope.compare = []
      $scope.showWelcome = true;
    }
    

    $timeout(function() {
      $scope.selectArea(areas);
    }, 0);
  };

  // Change view to detail
  $scope.goToDetail = function(data) {

    var areas = $state.params.areas;
    $state.go('dashboard.detail', {
      var: data.name,
      areas: areas
    });
  };

  // Watch for changes in selected theme and update view if changed
  $scope.$watch('selectedTheme', function(newTheme, oldTheme) {
    if (newTheme !== oldTheme) {
      $state.go('dashboard.cards', {
        areas: $state.params.areas,
        theme: newTheme
      });
    }
  });

  // Draw leaflet map
  $scope.map = function(map) {
    $rootScope.globalMap = map;

    map.zoomControl.setPosition('bottomright');

    $scope.geojsonLayer = L.layerGroup();
    $scope.geojsonLayer.addTo(map);

    $scope.markerLayer = new L.layerGroup();
    $scope.markerLayer.addTo(map);

    map.on('load', function(e) {
      if ($state.params.areas) {
        DashboardService
          .areasByCode($state.params.areas)
          .then(function(response) {
            switch (response.data[0].levelname) {
              case 'Amsterdam':
                $scope.levelname = 'Amsterdam';
                initLevel = 10;
                break;
              case 'Stadsdelen':
                $scope.levelname = 'Stadsdelen';
                initLevel = 11;
                break;
              case '22 gebieden':
                $scope.levelname = '22 gebieden';
                initLevel = 12;
                break;
              case 'Wijken':
                $scope.levelname = 'Wijken';
                initLevel = 13;
                break;
              case 'Buurten':
                $scope.levelname = 'Buurten';
                initLevel = 14;
                break;
              default:
                initLevel = 10;
                break;
            }

            map.setView([52.373075, 4.892665], initLevel);
            getAreas($scope.levelname)
        });
      } else if (!$state.params.areas) {
        map.setView([52.373075, 4.892665], 10);
        $scope.levelname = 'Amsterdam';
        getAreas($scope.levelname)
      }
    });

    map.on('zoomend', function() {
      var zoom = map.getZoom();
      // Determine zoom level
      if (zoom === 10) levelname = 'Amsterdam';
      if (zoom === 11) levelname = 'Stadsdelen';
      if (zoom === 12) levelname = '22 gebieden';
      if (zoom === 13) levelname = 'Wijken';
      if (zoom === 14) levelname = 'Buurten';
      getAreas(levelname)
    })
  };

  function getAreas(level) {
    DashboardService
    .areaByLevel(level)
    .then(function(response) {
      $scope.geojsonLayer.clearLayers();
      var geoJsonFeatures = [];
      // Retrieve GeoJSON from each response
      for (i = 0; i < response.data.length; i++) {
        geoJsonFeatures.push(response.data[i].geojson);
      }
      // Add new GeoJSON feature layer to layerGroup
      $scope.geojson = L.geoJson(geoJsonFeatures, {
        style: function (feature) {
          return {
            color: '#333',
            weight: 2,
            fillOpacity: 0
          };
        },
        onEachFeature: function (feature, layer) {
          // Determine name and code of each feature
          var code;
          var name;
          if (feature.properties.STAD) {
            code = feature.properties.STAD_;
            name = feature.properties.STAD;
          }
          else if (feature.properties.Buurt) {
            code = feature.properties.Buurt_code;
            name = feature.properties.Buurt;
          }
          else if (feature.properties.Buurtcom00) {
            code = feature.properties.Buurtcombi;
            name = feature.properties.Buurtcom00;
          }
          else if (feature.properties.Gebied) {
            code = feature.properties.Gebied_cod;
            name = feature.properties.Gebied;
          }
          else if (feature.properties.Stadsdeel) {
            code = feature.properties.Stadsdeel_;
            name = feature.properties.Stadsdeel;
          }
          $scope.$watch('compare', function(oldVal, newVal) {

            if (checkCompare(code) > -1) {
              layer.setStyle({
                fillOpacity: 0.7,
                fillColor: $rootScope.compareColors[checkCompare(code)]
              });
            }
            else {
              layer.setStyle({
                fillOpacity: 0
              });
            }

          });
          // Highlight on mouseover
          layer.on('mouseover', function(e) {
            layer.setStyle({
              color: '#ED2845',
              weight: 5
            })
          });
          layer.on('mouseout', function(e) {
            layer.setStyle({
              color: '#333',
              weight: 2
            })
          });
          layer.on('click', function(e) {
            // Determine if compare mode is on
            if ($rootScope.compareSelection === false) {
              $state.go($state.current.name, {areas: code}, {notify: false});
              $scope.selectArea(code);
            } else {
              $rootScope.compareSelection = false;
              // Get values for new area to compare and show in graph
              if ($state.params.areas.length === 0) {
                $state.params.areas += code
                $state.go($state.current.name, {areas: areas}, {notify: false});
                $scope.selectArea(areas);
              } else {
                if ($state.params.areas.indexOf(code) == -1) {
                  var areas = $state.params.areas += (',' + code);
                  $state.go($state.current.name, {areas: areas}, {notify: false});
                  $scope.selectArea(areas);
                }
              }
            }

          });
        }
      }).addTo($scope.geojsonLayer);

      return
    });
  };

  function checkCompare(code) {
    var array = $rootScope.compare;
    return compareIndex = array.map(function(d) { return d['code']; }).indexOf(code);
  }

  // Set inital area and theme based on params
  $scope.init = function() {
    if ($state.params.areas) {
      $scope.selectArea($state.params.areas);
    }

    $rootScope.selectedTheme = $state.params.theme;
  };

  $scope.init();


});
