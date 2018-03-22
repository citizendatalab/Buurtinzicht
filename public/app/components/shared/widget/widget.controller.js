angular.module('app.controllers')

.controller('WidgetController', function($scope, $rootScope, $window, widgetData, widgetParams, WidgetService) {
  $scope.widgetData = widgetData;

  $scope.selectedOption = {
    'option': 'none',
    'text': '',
    'subject': ''
  };

  if (widgetParams.class === 'single') {
    $scope.activeView = 'graph';
    $scope.selectedOption.variable = widgetData.variable.id;
  }
  else if (widgetParams.class === 'group') {
    $scope.activeView = 'pie';
    $scope.selectedOption.group = widgetData.group.id;
  }
  $scope.selectView = function(data) {

    if (data !== $scope.activeView) {
      $scope.activeView = data;

    }
  };
  $scope.showInfo = false;
  $scope.colorArray = ['#084081','#0868ac','#2b8cbe','#4eb3d3','#7bccc4','#a8ddb5','#ccebc5','#e0f3db','#f7fcf0'];

  $scope.selectOption = function(data) {
    $scope.selectedOption.option = data;
  };
  $scope.activeOption = function(data) {
    if ($scope.selectedOption.option === 'none') {
      return
    } else {
      if ($scope.selectedOption.option === data) {
        return 'bi-selected'
      } else {
        return 'bi-selected-false'
      }
    }
  };

  $scope.submitFeedback = function() {
    if ($scope.selectedOption === 'none') {
      console.log('none');
      return
    } else {
      WidgetService.submitFeedback($scope.selectedOption)
      $scope.selectedOption = {
        'option': 'none',
        'text': ''
      };
    }
  };

  // Draw leaflet map
  $scope.map = function(map) {
    // Center on District
  
    var district = L.geoJson($scope.widgetData.area.geojson);
    var districtCenter = district.getBounds().getCenter()

    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.setView(districtCenter, 12);
    map.zoomControl.setPosition('bottomright');

    $scope.geojsonLayer = L.featureGroup();
    $scope.geojsonLayer.addTo(map);

    map.on('ready', function() {
      $scope.$watch('activeView', function(newV, oldV) {
             map.invalidateSize();
        if (newV !== 'graph') {
          // Clear existing geojson features
          $scope.geojsonLayer.clearLayers();
          var values = [];
          var geoJsonFeatures = [];

          // Retrieve GeoJSON from each response
          if ($scope.activeView === 'inner') {
       
            for (i = 0; i < widgetData.children.length; i++) {
              widgetData.children[i].geojson.properties['value'] = widgetData.children[i].value;
              geoJsonFeatures.push(widgetData.children[i].geojson);
              if (widgetData.children[i].value !== 'Geen data') {
                values.push(parseInt(widgetData.children[i].value));

              }

            }
          } else if ($scope.activeView === 'outer') {
            for (i = 0; i < widgetData.district.length; i++) {
              widgetData.district[i].geojson.properties['value'] = widgetData.district[i].value;
              geoJsonFeatures.push(widgetData.district[i].geojson);
              if (widgetData.district[i].value !== 'Geen data') {
                values.push(parseInt(widgetData.district[i].value));
              }
            }
          } else if ($scope.activeView === 'city') {
            for (i = 0; i < widgetData.city.length; i++) {
              widgetData.city[i].geojson.properties['value'] = widgetData.city[i].value;
              geoJsonFeatures.push(widgetData.city[i].geojson);
              if (widgetData.city[i].value !== 'Geen data') {
                values.push(parseInt(widgetData.city[i].value));
              }
            }

          }

          var maxVal = Math.max.apply(Math, values);
          var minVal = Math.min.apply(Math, values);
          var diff = maxVal - minVal;
          var colorBound = diff / 5;
          $scope.colorMap = [];
          for (var i = 0; i < 5; i++) {
            if (i < 4) {
              $scope.colorMap.push({'value': (minVal + colorBound * [i]).toFixed(0), 'label': (minVal + colorBound * [i]).toFixed(0) + ' tot ' + (minVal + colorBound * [i + 1]).toFixed(0), 'color': $scope.colorArray[i]});
            }
            if (i === 4) {
              $scope.colorMap.push({'value': (minVal + colorBound * [i]).toFixed(0), 'label': (minVal + colorBound * [i]).toFixed(0) + '+', 'color': $scope.colorArray[i]});
            }
      
          }
          function getColor(d) {
            if (d === 'Geen data') {
              return '#9e9e9e';
            } else {
              return d > $scope.colorMap[4].value ? $scope.colorMap[4].color:
                     d > $scope.colorMap[3].value ? $scope.colorMap[3].color:
                     d > $scope.colorMap[2].value ? $scope.colorMap[2].color:
                     d > $scope.colorMap[1].value ? $scope.colorMap[1].color:
                                                    $scope.colorMap[0].color;
            }
          }

          // Add new GeoJSON feature layer to layerGroup
          $scope.geojson = L.geoJson(geoJsonFeatures, {
            style: function (feature) {
              return {
                color: '#95a5a6',
                weight: 2,
                fillOpacity: 0.7,
                fillColor: getColor(feature.properties.value),
              };
            },
            onEachFeature: function (feature, layer) {
              var center = layer.getBounds().getCenter();

              var content;
                if ($scope.activeView === 'inner') {
                  content = feature.properties.Buurtcom00 + ': ' + feature.properties.value
                } else if ($scope.activeView === 'outer') {
                  content = feature.properties.Gebied + ': ' + feature.properties.value
                } else if ($scope.activeView === 'city') {
                  content = feature.properties.Stadsdeel + ': ' + feature.properties.value
                }
              var popup = L.popup({
                className: 'bi-widget-popup'
              })
                // .setLatLng(center)
                .setContent(content)

              // Highlight on mouseover
              layer.on('mouseover', function(e) {
                layer.setStyle({
                  fillOpacity: 1
                });
                popup.setLatLng(e.latlng);
                layer.bindPopup(popup).openPopup();
              });
              layer.on('mouseout', function(e) {
                layer.setStyle({
                  fillOpacity: 0.7
                });
                layer.closePopup();
              });
            }
          }).addTo($scope.geojsonLayer);

          map.invalidateSize();

          var districtCenter = $scope.geojson.getBounds().getCenter();

          if ($scope.activeView === 'inner') {
            map.setView([districtCenter.lat, districtCenter.lng], 12, {animate: false});
          } else if ($scope.activeView === 'outer') {
            map.setView([districtCenter.lat, districtCenter.lng], 11, {animate: false});
          } else if ($scope.activeView === 'city') {
            map.setView([districtCenter.lat, districtCenter.lng], 9, {animate: false});
          }
        }
      });
    });
  };

});
