angular.module('app.directives')

.directive('gridBlock', function($rootScope, d3Service, WrapService) {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      d3Service.d3().then(function(d3) {
   
        // Set width based on areas and initialize height on 0
        if (scope.data.group === false) {
          var areaCount = scope.data.areas.length,
              width = 150,
              height = 0;
          if (areaCount > 1) {
            width = 105 * areaCount;
          }
        }

        if (scope.data.group === true) {
          var height = 0,
              width = 155;
          if (scope.data.variables.length === 0 ) {
            var areaCount = 0;
          } else {
            var areaCount = scope.data.variables[0].areas.length;
            if (areaCount > 1) {
              width = 105 * areaCount;
            }
          }
        }

        // Calculate relative height of each absolute bar
        if (scope.data.group === false && (scope.data.type === 2 || scope.data.type === 8)) {
          var array = scope.data.areas,
              max = Math.max.apply(null, array.map(function(area) {
              return parseFloat(area.value);
          }));
          // point per pixel
          if (max === 0) {
            var ppp = 1;
          } else {
         
            var ppp = max / 100;
          }

        }

        // Create d3 element
        var svg = d3.select(element[0])
        .append('svg')
          .attr('width', width)

        scope.render = function(data) {
  
          // Remove previous render
          svg.selectAll('*').remove();

          var y = {
            header: 12,
            body: 21,
            footer: 136
          };

          console.log(data)
          if (data.group === false) {
       
            data.areas.forEach(function(d, i) {
              // Reset height
              var x = 105 * i;

              d.value = parseFloat(d.value);

              var header = svg.append('text')
                .attr('x', x)
                .attr('y', 12)
                .attr('font-family', 'Karla')
                .attr('font-size', '18px')
                .text(d.value);
         
              if(data.location == true && data.areas.length == i+1){
               svg.append('image')
                .attr('xlink:href', './assets/icons/location.svg')
                .attr('width', 16)
                .attr('height', 16)
                .attr('x', x+90)
                .attr('y', 0);
              }
              

                switch(data.type) {
                  case 1:
                  // Percentage
                    header.text(d.value + ' %');
                    var body = svg.append('rect')
                      .attr('x', x)
                      .attr('y', y.body)
                      .attr('width', 100)
                      .attr('height', 100)
                      .attr('fill', '#E6E7E8');

                    var fillerHeight = 100 * (d.value / 100);
                    var filler = svg.append('rect')
                      .attr('x', x)
                      .attr('y', y.body + (100 - fillerHeight))
                      .attr('width', 100)
                      .attr('height', fillerHeight)
                      .attr('fill', $rootScope.compareColors[i]);

                    break;

                  case 2:

                    // Absolute
                    var relativeSize = d.value / ppp;
                    var rectSize = Math.sqrt(10000*(relativeSize/100))
                    var body = svg.append('rect')
                      .attr('x', x + 2)
                      .attr('y', function() {
                        //if (d.value === 0) {
                        //  return y.body;
                        //}
                        return y.body + (100 - rectSize)
                      })
                      .attr('width', function() {
                        if (d.value === 0) {
                          return 100;
                        }

                        return rectSize;
                        //return d.value / ppp;
                      })
                      .attr('height', function() {
                        if (d.value === 0) {
                          return 1;
                        }
                        return rectSize;
                        //return d.value / ppp;
                      })
                      .attr('fill', '#E6E7E8')
                      .attr('stroke' , $rootScope.compareColors[i])
                      .attr('stroke-width', 2);

                    break;

                  case 3:
                    // Grade
                    header.text(d.value + ' / 10');

                    // Get partialbar and number of full bars
                    var gradeModulo = (d.value % 1).toFixed(1);
                    var gradeBars = d.value - gradeModulo

                    // Draw colored full bars
                    for (var a = 0; a < gradeBars; a++) {
                      svg.append('line')
                        .attr('x1', x + 10 * a + 5)
                        .attr('y1', y.body)
                        .attr('x2', x + 10 * a + 5)
                        .attr('y2', y.body + 100)
                        .attr('stroke-width', 2)
                        .attr('stroke', $rootScope.compareColors[i]);
                    }

                    // Draw remaining bars
                    for (var a = gradeBars; a < 10; a++) {
                      svg.append('line')
                        .attr('x1', x + 10 * a + 5)
                        .attr('y1', y.body)
                        .attr('x2', x + 10 * a + 5)
                        .attr('y2', y.body + 100)
                        .attr('stroke-width', 2)
                        .attr('stroke', '#E6E7E8');
                    }

                    // Draw partial bars
                    svg.append('line')
                      .attr('x1', x + 10 * (gradeBars) + 5)
                      .attr('y1', y.body + (100 * (1 - gradeModulo)))
                      .attr('x2', x + 10 * (gradeBars) + 5)
                      .attr('y2', y.body + 100)
                      .attr('stroke-width', 2)
                      .attr('stroke', $rootScope.compareColors[i]);

                    break;

                  case 4:
                    // index
                    var body = svg.append('rect')
                      .attr('x', x)
                      .attr('y', y.body)
                      .attr('width', 100)
                      .attr('height', 100)
                      .attr('fill', '#e6e7e8');

                    // Draw native index
                    svg.append('line')
                      .attr('x1', x)
                      .attr('y1', y.body + 50)
                      .attr('x2', x + 100)
                      .attr('y2', y.body + 50)
                      .attr('stroke-width', 3)
                      .attr('stroke', '#fff');

                    // Draw area index
                    svg.append('line')
                      .attr('x1', x)
                      .attr('y1', y.body + (100 - d.value / 2))
                      .attr('x2', x + 100)
                      .attr('y2', y.body + (100 - d.value / 2))
                      .attr('stroke-width', 3)
                      .attr('stroke', $rootScope.compareColors[i]);

                    break;

                  case 5:
                    // Average
                    var body = svg.append('rect')
                      .attr('x', x)
                      .attr('y', y.body)
                      .attr('width', 100)
                      .attr('height', 100)
                      .attr('fill', '#E6E7E8');

                    var line = svg.append('line')
                      .attr('x1', x + 50)
                      .attr('y1', y.body)
                      .attr('x2', x + 50)
                      .attr('y2', y.body + 100)
                      .attr('stroke-width', 3)
                      .attr('stroke', $rootScope.compareColors[i]);

                    break;

                  case 6:
                  // Euro
                  header.text(d.value + ' €');
                  var body = svg.append('circle')
                    .attr('cy', y.body + 50)
                    .attr('cx', x + 50)
                    .attr("r", 48)
                    .attr('fill', '#E6E7E8')
                    .attr('stroke' , $rootScope.compareColors[i])
                    .attr('stroke-width', 2);

                  break;

                  case 7:
                    // Score
                    var scoreArray = ['A+', 'A', 'B', 'C', 'D']
                    var score = scoreArray[d.value - 1];
                    header.text(score);

                    // Get number of empty and full bars, always draw 1
                    var barEmpty = d.value - 1;
                    var barFull = 5 - d.value + 1;

                    // Draw empty bars and adjust height
                    for (var a = 0; a < barEmpty; a++) {
                      svg.append('rect')
                        .attr('x', x)
                        .attr('y', y.body + 20 * a)
                        .attr('width', 100)
                        .attr('height', 18)
                        .attr('fill', '#E6E7E8');
                      height += 20
                    }

                    // Draw full bars and adjust height
                    for (var a = barEmpty; a < (barFull + barEmpty); a++) {
                      svg.append('rect')
                      .attr('x', x)
                        .attr('y', y.body + 20 * a)
                        .attr('width', 100)
                        .attr('height', 18)
                        .attr('fill', $rootScope.compareColors[i]);
                    }

                    break;

                  case 8:
                    // Surface
                    header.text(d.value + ' ha');

                    if (d.value === 0) {
                      var polystring = x +',' + y.body + ' ' + x + ',' + (y.body + 100) + ' ' + (x + 100)+ ',' + y.body;
                    } else {
                      var polystring = x +',' + y.body + ' ' + x + ',' + (y.body + d.value / ppp) + ' ' + (x + d.value / ppp)+ ',' + y.body;
                    }

                    var body = svg.append('polygon')
                      .attr('points', polystring)
                      .attr('fill', $rootScope.compareColors[i])

                    break;
                }
            })
          }

          if (data.group === true) {
       
            var variableHeight = 0;

            var background = svg.append('rect')
              .attr('width', width)
              // .attr('height', backgroundHeight)
              .attr('fill', '#fff')
              .attr('stroke', '#ED2845')
              .attr('stroke-width', 3);

           if (data.name === 'LEEF7_GRP') {
              data.variables.sort(function(a, b) {
                if (a.label !== '65-plussers' && b.label !== '65-plussers') {
                  var x = a.label.split(' ')[2];
                  var y = b.label.split(' ')[0];
                } else if (a.label === '65-plussers') {
                  var x = a.label.split('-')[0];
                  var y = b.label.split(' ')[0];
                } else if (b.label === '65-plussers') {
                  var x = a.label.split(' ')[2];
                  var y = b.label.split('-')[0];
                }

                return x - y;
              });
            } else if (data.name === 'LEEF5_GRP') {
              data.variables.sort(function(a, b) {
                if (a.label !== '100-plussers' && b.label !== '100-plussers') {
                  var x = a.label.split(' ')[2];
                  var y = b.label.split(' ')[0];
                } else if (a.label === '100-plussers') {
                  var x = a.label.split('-')[0];
                  var y = b.label.split(' ')[0];
                } else if (b.label === '100-plussers') {
                  var x = a.label.split(' ')[2];
                  var y = b.label.split('-')[0];
                }

                return x - y;
              });
            } else {
              data.variables.sort(function(a,b) {
                return (a.label < b.label) ? -1 : (a.label > b.label) ? 1 : 0;
              });
            }

            var max = d3.max(data.variables, function(variable) {
              return d3.max(variable.areas, function(area) {
                return parseInt(area.value);
              });
            });

            // Determine bar length based on points per pixel
            if (105 * areaCount < 105) {
              var pointsPerPixel = (150 - 50) / max
            } else {
              var pointsPerPixel = (105 * areaCount - 50) / max
            }


            data.variables.forEach(function(variable, a) {
              //Very bad for performance on FF. Maybe use a canvas for these graphs
                
              var label = svg.append('text')
                .attr('x', 5)
                .attr('y', variableHeight + 15)
                .attr('font-family', 'Karla')
                .attr('font-size', '12px')
                .text(variable.label)
                // .call(WrapService.wrap);

              var labelDimensions = label.node().getBBox();

              if (labelDimensions.width > width) {
                width = label.node().getBBox().width;
              }
              

              variable.areas.forEach(function(area, i) {
                switch(data.type) {
                  case 1:
                    var barWidth = parseInt(area.value) * areaCount,
                        offset = 0;
                    break;
                  default:
                    var barWidth = area.value * pointsPerPixel,
                        offset = 0;
                    break;
                }
                      
                svg.append('rect')
                  .attr('x', 5)
                  .attr('y', variableHeight + 20 * i + labelDimensions.height + 5)
                  .attr('width', barWidth)
                  .attr('height', 20)
                  .attr('fill', $rootScope.compareColors[i])
                  .call(function() {
                    offset = this.node().getBBox().width;
                    return;
                  })

                svg.append('text')
                  .attr('x', offset + 10)
                  .attr('y', variableHeight + 20 * i + labelDimensions.height + 17)
                  .attr('font-family', 'Karla')
                  .attr('font-size', '12px')
                  .text(area.value)
                
              })

              variableHeight += labelDimensions.height + 20 * areaCount + 5;
            });
          }

          var descText = data.label  + ' in ' + data.year;
          var desc = svg.append('text')
            .attr('x', function() {
              if (data.group === true) {
                return 5
              } else {
                return 0
              }
            })
            .attr('y', function() {
              if (data.group === false) {
                return y.footer;
              } else {
                return variableHeight + 40;
              }
            })
            .attr('font-family', 'Karla')
            .attr('font-size', '14px')
            .text(data.label  + ' in ' + data.year)
            // .call(WrapService.wrap);
          desc.append('title').text(data.label  + ' in ' + data.year);

          descDimensions = desc.node().getBBox();

          svg.on('mouseover', function(d) {
            desc.style({'fill': '#ED2845'});
            svg.style({'cursor': 'pointer'});
          })
          .on('mouseout', function(d) {
            desc.style({'fill': '#000'});
            svg.style({'cursor': 'default'});
          });

          var bgHeight = variableHeight + descDimensions.height + 10;

          if (data.group === false) {
            var height = y.footer + descDimensions.height;
          } else {
            var height = bgHeight + 30;
            background.attr('height', height)
           var lineDraw = svg.append('line')
            .attr('x1', 0)
            .attr('x2', width)
            .attr('y1',variableHeight+15)
            .attr('y2',variableHeight+15)
            .attr('style', 'stroke:#ED2845;stroke-width:2')
          }

          // Set dimensions on svg, width only when +100
          svg.attr('height', height)

          // Set dimensions on parent
          element.css({'height': height + 'px'});
          if (width > 150) {
            element.css({'width': width + 'px'});
          }
        };

        // Render visualisation
        scope.render(scope.data);

      });
    }
  };
})
