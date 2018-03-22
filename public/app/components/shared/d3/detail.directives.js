angular.module('app.directives')

.directive('detailSingle', function(d3Service, GraphService, $state, $window, $rootScope) {

  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      d3Service.d3().then(function(d3) {


        var width, height;

        // Set margins and locale
        var margin = { top: 100, right: 50, bottom: 20, left: 80 };
        var NL = GraphService.getNL();

        // Create d3 element
        var svg = d3.select(element[0])
          .append('svg')

        var x = d3.time.scale();
        var y = d3.scale.linear();
        var parseDate = d3.time.format('%Y').parse;

        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

        // window.addEventListener('resize', scope.render);

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function(newW) {
          // Workaround, need proper responsiveness
          if (newW < 800) {
            width = parseInt(d3.select('.dashboard-detail-graph').style('width'), 10);
          } else {
            width = newW / 2;
          }
          height = parseInt(d3.select('.dashboard-detail-graph').style('height'), 10);
          svg.attr({
            width: width,
            height: height,
          });

          x.range([margin.left, width - margin.right]);
          y.range([height - margin.bottom, margin.top])
          scope.render(scope.data);
        });

        // Watch for data change
        scope.$watch('data', function(newData, oldData) {
          if (newData !== oldData) {
            scope.render(scope.data);
          }
        });

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom')

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .outerTickSize(0)
          .ticks(10)

        var line = d3.svg.line()
          .x(function(d) { return x(d.year); })
          .y(function(d) { return y(d.value); });

        scope.render = function(data) {
          

            //Remove previous render
            svg.selectAll('*').remove();
            if (!data.areas) {
              return
            }

            data.areas.forEach(function(d) {
              d.values = GraphService.sortByKey(d.values, 'year');
            })

            // Match order with compare
            data.areas = GraphService.sortByOrder(data.areas, $state.params.areas);

            // Set domains
            var xMax = d3.max(data.areas, function(d) {
              return d3.max(d.values, function(d) {
                if (typeof d.year === 'string') {
                  d.year = d3.time.format('%Y').parse(d.year.toString());
                }
                return d.year;
              });
            });

            var xMin = d3.min(data.areas, function(d) {
              return d3.min(d.values, function(d) {
                return d.year;
              });
            });

            x.domain([xMin, xMax]);
            xAxis.ticks(d3.time.years, 1);
            if (width < 550) {
              xAxis.ticks(d3.time.years, 2);
            }

            if (data.type == 1) {
              y.domain([0, 100]);
            } else if (data.type == 3) {
              y.domain([0, 10]);
            } else {
              var yMax = d3.max(data.areas, function(d) {
                return d3.max(d.values, function(d) {
                  d.value = +d.value;
                  return d.value;
                });
              });

              y.domain([0, yMax * 1.25]);
            }

            // Draw axis
            svg.append('g')
              .attr('class', 'x axis')
              .attr('transform', 'translate(0,' + (height - margin.bottom) + ')')
              .call(xAxis)
              .style('font-size','14px');

            svg.append("g")
              .attr('class', "y axis")
              .attr('transform', 'translate(' + margin.left+ ', 0)')
              .style('font-size','14px')
              .call(yAxis)
            .append('text')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('dy', '.71em')

            var legendWidth = margin.left;
            var legendY = 20;

            data.areas.forEach(function(d, i) {
              // Draw line
              svg.append('path')
                .attr('d', line(d.values))
                .attr('class', 'line')
                .attr('stroke', $rootScope.compareColors[i]);

              // Draw dots
              svg.selectAll('.rect' + i)
                .data(d.values)
              .enter().append('rect')
                .attr('class', 'rect')
                .attr('width', 5)
                .attr('height', 5)
                .attr('x', function(d) { return x(d.year) - 2.5; })
                .attr('y', function(d) { return y(d.value) - 2.5; })
                .style('fill', $rootScope.compareColors[i])
                .append('title').text( function(d) { return d.value})


              // Append legend
              var areaCalculation = svg.append('text')
                .attr('x', 0)
                .attr('y', 0)
                .attr('font-family', 'Karla')
                .attr('font-size', '16px')
                .text(d.area)
                .call(function() {
                  // legendElementWidth = (colorblock width + spacing + text width)
                  var legendElementWidth = this.node().getBBox().width;
                  // remove after calculating width and update Y
                  this.remove();
                  if (legendWidth + legendElementWidth > width - margin.left - margin.right) {
                    legendY += 20;
                    legendWidth = margin.left;
                  }
                })

              svg.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('x', legendWidth)
                .attr('y', legendY)
                .style('fill', $rootScope.compareColors[i])

              legendWidth += 15;

              var area = svg.append('text')
                .attr('x', legendWidth)
                .attr('y', legendY + 10)
                .attr('font-family', 'Karla')
                .attr('font-size', '16px')
                .text(d.area);

              legendWidth += area.node().getBBox().width + 20;
            });
          
        };

      });
    }
  };
})

.directive('detailGroup', function(d3Service, GraphService, $state, $window, $rootScope) {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      d3Service.d3().then(function(d3) {
        // Set data override for updates
        scope.data = $rootScope.details;

        // Set margins and locale
        var margin = { top: 100, right: 50, bottom: 40, left: 80 },
            width = parseInt(d3.select('.dashboard-detail-graph').style('width'), 10),
            height = parseInt(d3.select('.dashboard-detail-graph').style('height'), 10),
            NL = GraphService.getNL(),
            barPadding = 6,
            columnPadding = 2;

        // Create d3 element
        var svg = d3.select(element[0])
          .append('svg')

        var x = d3.scale.ordinal();
        var y = d3.scale.linear();
        var parseDate = d3.time.format('%Y').parse;

        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function(newW) {
          // Workaround, need proper responsiveness
          if (newW < 800) {
            width = parseInt(d3.select('.dashboard-detail-graph').style('width'), 10);
          } else {
            width = newW / 2;
          }
          height = 400;
          svg.attr({
            width: width,
            height: height,
          });

          x.range([margin.left, width - margin.right]);
          x.rangeRoundBands([margin.left, width - margin.right])
          y.range([height - margin.bottom, margin.top])
          scope.render(scope.data);
        });

        // Watch for data change
        scope.$watch('data', function(newLength, oldLength) {
          if (newLength !== oldLength) {
            scope.render(scope.data);
          }
        },true);

        // TO DO: Update with responsive bars (See widget)
        var xAxis = d3.svg.axis()
          .scale(x)
          .orient('bottom');

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient('left')
          .outerTickSize(0)
          .ticks(10)

        scope.render = function(data) {
          //Remove previous render
          svg.selectAll('*').remove();
          height = 400;

          data.years = GraphService.sortByKey(data.years, 'year');

          // Match order of areas with compare for each year
          data.years.forEach(function(year) {
            year.areas = GraphService.sortByOrder(year.areas, $state.params.areas);
            year.areas.forEach(function(area) {
              area.values = GraphService.sortByKey(area.values, 'label')
            })
          });
           
          // Set domains
          var xMax = d3.max(data.years, function(year) {
            return year.year
          });

          var xMin = d3.min(data.years, function(year) {
            return year.year
          });

          var xDomain = Array.apply(null, {length: xMax + 1 - xMin}).map(function(_, idx) {
            return idx + xMin;
          });

          x.domain(xDomain);
          // if (width < 550) {
          //   xAxis.tickValues(xDomain.filter(function(d, i) { return !(i % 2);}))
          // } else {
          //   xAxis.tickValues(xDomain);
          // }
          if (data.type == 1) {
            var yMax = 100;
            y.domain([0, 100]);
          } else {
            var yMax = d3.max(data.years, function(year) {
              return d3.max(year.areas, function(area) {
                return d3.sum(area.values, function(value) {
                  return value.value;
                });
              });
            });
            y.domain([0, yMax]);
          }

          var yearCount = data.years.length;
              variableCount = d3.max(data.years, function(year) {
                return d3.max(year.areas, function(area) {
                  return area.values.length;
                });
              }),
              areaCount = d3.max(data.years, function(year) {
                return year.areas.length;
              }),
              barWidth = ((x.rangeBand() - barPadding) / areaCount) - columnPadding;

          var pivot = Math.floor(variableCount / 2),
              barColors = d3.scale.linear()
                .domain([0, pivot, variableCount - 1])
                .interpolate(d3.interpolateRgb)
                .range([d3.rgb('#6C7A89'), d3.rgb('#e0e0e0'), d3.rgb('#ed2845')]);

          // Draw axis
          var xDraw = svg.append('g')
            .attr('class', 'x axis group')
            .attr('transform', 'translate(0, ' + (height - margin.bottom) + ')')
            .call(xAxis);

          xDraw.selectAll('text')
            .attr('x', 2)
            .attr('y', 30)
            .style('font-size','14px')
            .call(function() {
              if (width < 500) {
                this[0].forEach(function(d, i) {
                  if (i % 2) {
                    d.remove();
                  }
                })
              }
            })

          xDraw.selectAll('line')
            .attr('stroke-width', 2)
            .attr('y1', 28)
            .attr('y2', 28)
            .attr('x1', -(x.rangeBand() / 2) + (barPadding / 2))
            .attr('x2',  (x.rangeBand() / 2) - columnPadding);

          svg.append("g")
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + margin.left + ', 0)')
            .style('font-size','14px')
            .call(yAxis)

          var legendWidth = margin.left;
          var legendY = 20;

          data.years.forEach(function(year, i) {
            year.areas.forEach(function(area, j) {

              svg.append('rect')
                .attr('width', barWidth)
                .attr('height', 10)
                .attr('y', height - 30)
                // start at left margin, add the bar based on position in year array,
                // add the barPadding and add the left columnPadding
                // add the column based on position in area array and adjust with the padding
                .attr('x', margin.left + x.rangeBand() * i + barPadding + columnPadding + (barWidth + columnPadding) * j)
                .style('fill', $rootScope.compareColors[j])


              var combinedHeight = 0,
                  elementHeight = 0,
                  yPos = [];

              svg.selectAll('.bar-segment')
                .data(function() { return area.values; })
              .enter().append('rect')
                .attr('width', barWidth)
                .attr('height', function(d) {
                  elementHeight = d.value / yMax * (height - margin.top - margin.bottom);
                  combinedHeight += elementHeight;
                  yPos.push(combinedHeight)
                  return elementHeight;
                })
                .attr('x', margin.left + x.rangeBand() * i + barPadding + columnPadding + (barWidth + columnPadding) * j)
                .attr('y', function(d, x) {
                  return height - margin.bottom - yPos[x];
                })
                .style('fill', function(d , x) {
                  return barColors(x);
                })

            })
          });

          var areaWidth = margin.left;
          var areaY = 20;

          data.years[0].areas.forEach(function(area, i){
         

            //If 0, dont show in legend
            var areaCalculation = svg.append('text')
              .attr('x', 0)
              .attr('y', 0)
              .attr('font-family', 'Karla')
              .attr('font-size', '16px')
              .text(area.area)
              .call(function() {
                // legendElementWidth = (colorblock width + spacing + text width)
                var areaElementWidth = this.node().getBBox().width;
                // remove after calculating width and update Y
                this.remove();
                if (areaWidth + areaElementWidth > width - margin.left - margin.right) {
                  areaY += 20;
                  areaWidth = margin.left;
                }
              })

            svg.append('rect')
              .attr('width', 10)
              .attr('height', 10)
              .attr('x', areaWidth)
              .attr('y', areaY)
              .style('fill', $rootScope.compareColors[i])

            areaWidth += 15;

            var area = svg.append('text')
              .attr('x', areaWidth)
              .attr('y', areaY + 10)
              .attr('font-family', 'Karla')
              .attr('font-size', '16px')
              .text(area.area);

            areaWidth += area.node().getBBox().width + 20;
          })
          

          data.years[data.years.length-1].areas[0].values.forEach(function(value, i) {
            if(value.value != "0"){
              height += 20;

            svg.append('rect')
              .attr('width', 10)
              .attr('height', 10)
              .attr('x', margin.left)
              .attr('y', height)
              .style('fill', barColors(i))

            var area = svg.append('text')
              .attr('x', margin.left + 15)
              .attr('y', height + 10)
              .attr('font-family', 'Karla')
              .attr('font-size', '16px')
              .text(value.label);
            }
            

          });

          height += 20;

          svg.attr('height', height);

          // Set dimensions on parent
          element.css({'height': height + 'px'});


        };

      });
    }
  };
})
