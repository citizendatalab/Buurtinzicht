angular.module('app.directives')

.directive('widgetLineChart', function(d3Service, $window, $rootScope) {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      d3Service.d3().then(function(d3) {
        //Set margins, width, and height
        var margin = { top: 20, right: 50, bottom: 50, left: 80 };
        var width = parseInt(d3.select(".bi-widget-body").style('width'), 10);
        var height = parseInt(d3.select(".bi-widget-body").style('height'), 10);

        // Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
        .append("svg")

        var x = d3.time.scale();
        var y = d3.scale.linear();
        var header = document.getElementById('bi-widget-card-header').offsetHeight;
        var parseDate = d3.time.format('%Y').parse;
        var bisectDate = d3.bisector(function(d) { return d.year; }).left;

        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          var currentHeader = document.getElementById('bi-widget-card-header').offsetHeight;
          var offset = 0;
          if (currentHeader !== header) {
            offset = header - currentHeader;
            header = currentHeader;
          }
          width = parseInt(d3.select(".bi-widget-body").style('width'), 10);
          height += offset;
          svg.attr({
            width: width,
            height: height,
          });
          x.range([margin.left, width - margin.right]);
          y.range([height - margin.bottom, margin.top])
          scope.render(scope.data);
        });

        // Watch for data change
        scope.$watch('data', function(newV, oldV) {
          if (newV !== oldV) {
            scope.render(scope.data);
          }
        }, true);

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")

        var breakpoints = {
          'large': 840,
          'small': 570
        }

        var heightBreaks = {
          'large': 50,
          'small': 25
        }

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .outerTickSize(0)

        var line = d3.svg.line()
          .interpolate("cardinal")
          .x(function(d) { return x(d.year); })
          .y(function(d) { return y(d.value); });

        var area = d3.svg.area()
          .interpolate("cardinal")
          .x(function(d) { return x(d.year); })
          .y0(function() { return height - margin.bottom; })
          .y1(function(d) { return y(d.value); });

        var focus = svg.append("g")
          .style("display", "none");

        // Sort the array based by year for axis
        function sortByKey(array, key) {
          return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });
        };

        scope.data.forEach(function(d) {
          d.year = parseDate(d.year);
          d.year = new Date(d.year);
          d.value = +d.value;
        });

        scope.render = function(data) {
          //Remove previous render
          svg.selectAll('*').remove();

          // Set domains
          x.domain(d3.extent(data, function(d) { return d.year; }));
          var min = d3.min(data, function(d) { return d.value; });
          var max = d3.max(data, function(d) { return d.value; });
          y.domain([0, max * 1.25]);

          if(width < breakpoints.small) {
            xAxis.ticks(d3.time.years, 3);
          } else if(width < breakpoints.large && width > breakpoints.small) {
            xAxis.ticks(d3.time.years, 2);
          } else {
            xAxis.ticks(d3.time.years, 1);
          }

          if(height < heightBreaks.small) {
            yAxis.ticks(1)
          } else if(height < heightBreaks.large && height > heightBreaks.small) {
            yAxis.ticks(3)
          } else {
            yAxis.ticks(5)
          }

          svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#fff");

          // Draw axis
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .style("font-size","14px");

          svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left+ ", 0)")
            .style("font-size","14px")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")

          // Draw line
          svg.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area)
            .style("fill", "rgba(8, 64, 129, 0.5)")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

          svg.append('path')
            .datum(data)
            .attr("class", "line")
            .attr('stroke', "rgb(8, 64, 129)")
            .attr("d", line);

          // Draw dots
          data.forEach(function(d, i) {
            svg.append("circle")
              .attr("class", "dot")
              .attr("r", 5)
              .attr("cx", x(d.year))
              .attr("cy", y(d.value))
              .style("fill", "#084081")
          });

          // Mouseover function
          var activeYear;
          function mousemove() {
            // Find closest year based on mousepos
            var year = x.invert(d3.mouse(this)[0]);
            var bisect = bisectDate(data, year, 1);
            var d0 = data[bisect - 1];
            var d1 = data[bisect];
            var activeYear = year - d0.year > d1.year - year ? d1 : d0;

            // Remove previous instances
            svg.selectAll(".bi-crossline").remove();
            svg.selectAll(".bi-highlight-text").remove();
            svg.selectAll(".bi-highlight-rect").remove();

            // Draw line to mark active year
            svg.append("line")
              .attr("x1", x(activeYear.year))
              .attr("y1", y(activeYear.value))
              .attr("x2", x(activeYear.year))
              .attr("y2", height - margin.bottom)
              .attr("class", "bi-crossline")
              .style("stroke-width", 1)
              .style("stroke", "#084081")
              .style("stroke-dasharray", ("6, 3"))
              .style("fill", "none");

            svg.append("text")
              .attr("x", x(activeYear.year))
              .attr("y", y(activeYear.value) - 10)
              .attr("class", "bi-highlight-text")
              .attr("text-anchor", "middle")
              .style("font-size", "16px")
              .style("font-weight", "bold")
              .text(activeYear.value)
              .style("z-index", "5");

            var textWidth = parseInt(d3.select(".bi-highlight-text").style('width'), 10) * 1.1;
            var textHeight = parseInt(d3.select(".bi-highlight-text").style('height'), 10) * 1.1;
            svg.insert("rect",".bi-highlight-text")
              .attr("x", x(activeYear.year) - (textWidth / 2))
              .attr("y", y(activeYear.value) - 16 - textHeight)
              .attr("width", textWidth)
              .attr("height", textHeight)
              .attr("class", "bi-highlight-rect")
              .style("fill", "#fff");
          }
        };
      });
    }};
  })

.directive('widgetStackedChart', function(d3Service, $window, $rootScope) {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      d3Service.d3().then(function(d3) {
        //Set margins, width, and height
        var margin = { top: 20, right: 50, bottom: 85, left: 80 };
        var width = parseInt(d3.select(".bi-widget-body").style('width'), 10);
        var height = parseInt(d3.select(".bi-widget-body").style('height'), 10);
        var type = scope.data.type;

        // Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
          .append("svg")

        var x = d3.time.scale();
        var y = d3.scale.linear();
        var color = d3.scale.ordinal().range(['#084081','#0868ac','#2b8cbe','#4eb3d3','#7bccc4','#a8ddb5','#ccebc5','#e0f3db','#f7fcf0']);
        var parseDate = d3.time.format('%Y').parse;
        var bisectDate = d3.bisector(function(d) { return d; }).left;

        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          width = parseInt(d3.select(".bi-widget-body").style('width'), 10);
          svg.attr({
            width: width,
            height: height,
          });
          scope.render(scope.data.values);
        });

        // Watch for data change
        scope.$watch('data', function(newV, oldV) {
          if (newV !== oldV) {
            scope.render(scope.data.values);
          }
        }, true);

        var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")

        var breakpoints = {
          'large': 840,
          'small': 570
        }

        var heightBreaks = {
          'large': 50,
          'small': 25
        }

        var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left");

        if (type === 'percentage') {
          yAxis.tickFormat(d3.format(".0%"));
        } else if (type === 'absolute') {
          yAxis.tickFormat(d3.format("d"));
        }

        // Stack the data
        var stack = d3.layout.stack()
          .offset("zero")
          .values(function(d) { return d.values; })
          .x(function(d) { return d.year; })
          .y(function(d) {
            if (type === 'percentage') {
              return d.value / 100;
            } else if (type === 'absolute') {
              return d.value
            }

          });

        // Nest the data based on area and sort by year
        var nest = d3.nest()
          .key(function(d) { return d.variable.label; })
          .sortKeys(d3.ascending);

        var nestYear = d3.nest()
          .key(function(d) { return d.year; })
          .sortKeys(d3.ascending);

        var area = d3.svg.area()
          .interpolate("cardinal")
          .x(function(d) { return x(d.year); })
          .y0(function(d) { return y(d.y0); })
          .y1(function(d) { return y(d.y0 + d.y); });

        var line = d3.svg.line()
          .interpolate("cardinal")
          .x(function(d) { return x(d.year); })
          .y(function(d) { return y(d.y0 + d.y); });

        var focus = svg.append("g")
          .style("display", "none");

        scope.data.values.forEach(function(d) {
          d.year = parseDate(d.year);
          d.year = new Date(d.year);
          d.value = +d.value;
        });

        scope.render = function(data) {
          //Remove previous render
          svg.selectAll('*').remove();

          // Missing value check
          // Get unique years
          var uniqueYears = [];
          for (var i = 0; i < data.length; i++) {
            if (uniqueYears.map(Number).indexOf(+data[i].year) < 0) {
              uniqueYears.push(data[i].year);
            }
          }
          // Sort by year
          uniqueYears.sort(function(a, b) {
            return new Date(a) - new Date(b);
          });

          // Check years for each label
          var nestedData = nest.entries(data);
          for (var i = 0; i < nestedData.length; i++) {
            for (var j = 0; j < uniqueYears.length; j++) {
              if (nestedData[i].values.map(function (d) {return +d.year;}).indexOf(+uniqueYears[j]) === -1) {
                var extraData = {
                  'value': 0,
                  'variable': nestedData[i].values[0].variable,
                  'year': uniqueYears[j]
                }
                data.push(extraData)
              }
            }
          }

          // Stack the data
          var grouped = nest.entries(data);
          if (scope.data.group.name === 'LEEF7_GRP') {
            grouped.sort(function(a, b) {
              if (a.key !== '65-plussers' && b.key !== '65-plussers') {
                var x = a.key.split(' ')[2];
                var y = b.key.split(' ')[0];
              } else if (a.key === '65-plussers') {
                var x = a.key.split('-')[0];
                var y = b.key.split(' ')[0];
              } else if (b.key === '65-plussers') {
                var x = a.key.split(' ')[2];
                var y = b.key.split('-')[0];
              }
              return x - y;
            });
          } else if (scope.data.group.name === 'LEEF5_GRP') {
            grouped.sort(function(a, b) {
              if (a.key !== '100-plussers' && b.key !== '100-plussers') {
                var x = a.key.split(' ')[2];
                var y = b.key.split(' ')[0];
              } else if (a.key === '100-plussers') {
                var x = a.key.split('-')[0];
                var y = b.key.split(' ')[0];
              } else if (b.key === '100-plussers') {
                var x = a.key.split(' ')[2];
                var y = b.key.split('-')[0];
              }
              return x - y;;
            });
          }
          var layers = stack(grouped);

          // Set domains
          x.domain(d3.extent(data, function(d) { return d.year; }));
          // Get maximum combined value of one year
          var yearValues = nestYear.entries(data)
          var maxYearValue = d3.max(yearValues, function(d){
            var sum = 0;
            for (var i = 0; i < d.values.length; i++) {
              sum += d.values[i].value;
            }
            return sum
          });

          if (type === 'absolute') {
            var min = d3.min(data, function(d) { return d.value; });
            var max = d3.max(data, function(d) { return d.value; });
            y.domain([0, maxYearValue]);
          }

          if(width < breakpoints.small) {
            xAxis.ticks(d3.time.years, 3);
          }
          else if(width < breakpoints.large && width > breakpoints.small) {
            xAxis.ticks(d3.time.years, 2);
          }
          else {
            xAxis.ticks(d3.time.years, 1);
          }

          if(height < heightBreaks.small) {
            yAxis.ticks(1)
          } else if(height < heightBreaks.large && height > heightBreaks.small) {
            yAxis.ticks(3)
          } else {
            yAxis.ticks(5)
          }

          // Set background
          svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "bi-widget-background")
            .attr("fill", "#fff");

          var longestLabel = 0;
          layers.forEach(function(d) {
            var chars = d.key.toString();
            if (chars.length > longestLabel) {
              longestLabel = chars.length
            }
          })

          // Draw legend
          var itemsPerRow = Math.floor(width / (longestLabel * 8 + 50));
          var totalRows = Math.ceil(layers.length / itemsPerRow);
          var legendWidth = ((width - 30 - 30) / itemsPerRow);
          margin.bottom = totalRows * 20 + 30;
          layers.forEach(function(d, i) {
            var itemPos = i % itemsPerRow;
            var rowPos = Math.floor(i / itemsPerRow);
            svg.append("circle")
              .attr("class", "dot")
              .attr("r", 5)
              .attr("cx", legendWidth * itemPos + 30)
              .attr("cy", height - margin.bottom + 35 + (20 * rowPos))
              .style("fill", function() { return color(d.key); })

            svg.append("text")
              .attr("x", legendWidth * itemPos + 40)
              .attr("y", height - margin.bottom + 40 + (20 * rowPos))
              .attr("class", "bi-widget-stacked-label")
              .style("font-size", "14px")
              .text(d.key + ': ');
          });

          x.range([margin.left, width - margin.right]);
          y.range([height - margin.bottom, margin.top])

          // Draw lines
          svg.selectAll(".area")
            .data(layers)
          .enter().append("path")
            .attr("d", function(d) { return area(d.values); })
            .attr("class", "area")
            .style("fill", function(d) { return color(d.key); })
            .style("opacity", 0.5);

          // Draw area's
          svg.selectAll('.line')
            .data(layers)
          .enter().append("path")
            .attr('d', function(d) { return line(d.values); })
            .attr("class", "line")
            .attr('stroke', function(d) { return color(d.key); })
            .attr('stroke-width', '0.5');

          // Set points for lines
          for (var i = 0; i < layers.length; i++) {
            svg.selectAll(".dot" + i)
              .data(layers[i].values)
            .enter().append("circle")
              .attr("class", "dot")
              .attr("r", 2)
              .attr("cx", function(d) { return x(d.year); })
              .attr("cy", function(d) { return y(d.y0 + d.y); })
              .style("fill", function(d) { return color(d.variable.label); })
          }

          // Interaction overlay
          svg.append("rect")
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("x", margin.left)
            .attr("y", margin.top)
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

          // Draw axis
          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis)
            .style("font-size","14px");

          svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + margin.left+ ", 0)")
            .style("font-size","14px")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")

        function getMaxYearValue(year) {
          var year = year.getFullYear();
          for (var i = 0; i < yearValues.length; i++) {
            var yearValue = new Date(yearValues[i].key)
            if (year === yearValue.getFullYear()) {
              var sum = 0;
              for (var j = 0; j < yearValues[i].values.length; j++) {
                sum += yearValues[i].values[j].value;
              }
              return sum
            }
          }
        }

          // Mouseover function
          var activeYear;
          function mousemove() {
            // Find closest year based on mousepos
            var year = x.invert(d3.mouse(this)[0]);
            var bisect = bisectDate(uniqueYears, year);
            var d0 = new Date(uniqueYears[bisect - 1]);
            var d1 = new Date(uniqueYears[bisect]);
            var activeYear = year - d0 > d1 - year ? d1 : d0;

            // Get matching values
            var values = [];
            for (var i = 0; i < data.length; i++) {
              if (data[i].year.getFullYear() === activeYear.getFullYear()) {
                values.push(data[i]);
              }
            }

            // Sort matching values alphabetically, exceptions for age
            if (scope.data.group.name === 'LEEF7_GRP') {
              values.sort(function(a, b) {
                if (a.variable.label !== '65-plussers' && b.variable.label !== '65-plussers') {
                  var x = a.variable.label.split(' ')[2];
                  var y = b.variable.label.split(' ')[0];
                } else if (a.variable.label === '65-plussers') {
                  var x = a.variable.label.split('-')[0];
                  var y = b.variable.label.split(' ')[0];
                } else if (b.variable.label === '65-plussers') {
                  var x = a.variable.label.split(' ')[2];
                  var y = b.variable.label.split('-')[0];
                }
                return x - y;
              });
            } else if (scope.data.group.name === 'LEEF5_GRP') {
              values.sort(function(a, b) {
                if (a.variable.label !== '100-plussers' && b.variable.label !== '100-plussers') {
                  var x = a.variable.label.split(' ')[2];
                  var y = b.variable.label.split(' ')[0];
                } else if (a.variable.label === '100-plussers') {
                  var x = a.variable.label.split('-')[0];
                  var y = b.variable.label.split(' ')[0];
                } else if (b.variable.label === '100-plussers') {
                  var x = a.variable.label.split(' ')[2];
                  var y = b.variable.label.split('-')[0];
                }
                return x - y;
              });
            } else {
              values.sort(function(a, b) {
                return d3.ascending(a.variable.label, b.variable.label);
              });
            }

            // Remove previous instances
            svg.selectAll(".crossline").remove();
            svg.selectAll(".keyValue").remove();

            // Draw line to mark active year
            svg.append("line")
              .attr("x1", x(activeYear))
              .attr("y1", y(getMaxYearValue(activeYear)))
              .attr("x2", x(activeYear))
              .attr("y2", height - margin.bottom)
              .attr("class", "crossline")
              .style("stroke-width", 1)
              .style("stroke", "#084081")
              .style("stroke-dasharray", ("6, 3"))
              .style("fill", "none");

            var labels = d3.selectAll(".bi-widget-stacked-label")

            // Update echt value in the legend
            values.forEach(function(d, i) {
              var itemPos = i % itemsPerRow;
              var rowPos = Math.floor(i / itemsPerRow);
              var labelWidth = labels[0][i].getBoundingClientRect().width;
              svg.append("text")
              .attr("x", legendWidth * itemPos + 50 + labelWidth)
              .attr("y", height - margin.bottom + 40 + (20 * rowPos))
                .attr("class", "keyValue")
                .style("font-size", "16px")
                .style("pointer-events", "none")
                .style("text-shadow", "1px 0 #000")
                .style("font-weight", "bold")
                .text(function() {
                  if (type === 'percentage') {
                    return d.value + ' %'
                  } else {
                    return d.value
                  }
                })
            });
          }
        };
      });
    }};
  })

.directive('widgetPieChart', function(d3Service, $window, $rootScope) {
  return {
    restrict: 'EA',
    scope: {
      data: '='
    },
    link: function(scope, element, attrs) {
      d3Service.d3().then(function(d3) {
        //Set margins, width, and height
        var margin = { top: 20, right: 50, bottom: 85, left: 50 };
        var width = parseInt(d3.select(".bi-widget-body").style('width'), 10);
        var height = parseInt(d3.select(".bi-widget-body").style('height'), 10);
        var radius = Math.min(width - 250, height) / 2;
        var type = scope.data.type;

        // Sort data by year and extract values from most recent
        scope.data.values.sort(function(a, b) {
          return d3.descending(a.year, b.year);
        })
        var values = [];
        var mostRecent = scope.data.values[0].year;
        for (var i = 0; i < scope.data.values.length; i++) {
          if (scope.data.values[i].year === mostRecent) {
            values.push(scope.data.values[i])
          }
        }
        if (scope.data.group.name === 'LEEF7_GRP') {
          values.sort(function(a, b) {
            if (a.variable.label !== '65-plussers' && b.variable.label !== '65-plussers') {
              var x = a.variable.label.split(' ')[2];
              var y = b.variable.label.split(' ')[0];
            } else if (a.variable.label === '65-plussers') {
              var x = a.variable.label.split('-')[0];
              var y = b.variable.label.split(' ')[0];
            } else if (b.variable.label === '65-plussers') {
              var x = a.variable.label.split(' ')[2];
              var y = b.variable.label.split('-')[0];
            }

            return x - y;
          })
        } else if (scope.data.group.name === 'LEEF5_GRP') {
          values.sort(function(a, b) {
            if (a.variable.label !== '100-plussers' && b.variable.label !== '100-plussers') {
              var x = a.variable.label.split(' ')[2];
              var y = b.variable.label.split(' ')[0];
            } else if (a.variable.label === '100-plussers') {
              var x = a.variable.label.split('-')[0];
              var y = b.variable.label.split(' ')[0];
            } else if (b.variable.label === '100-plussers') {
              var x = a.variable.label.split(' ')[2];
              var y = b.variable.label.split('-')[0];
            }

            return x - y;
          });
        } else {
          values.sort(function(a, b) {
            return d3.ascending(a.variable.label, b.variable.label);
          })
        }

        // Create the d3 element and position it based on margins
        var svg = d3.select(element[0])
          .append("svg")

        var color = d3.scale.ordinal().range(['#084081','#0868ac','#2b8cbe','#4eb3d3','#7bccc4','#a8ddb5','#ccebc5','#e0f3db','#f7fcf0']);

        // Browser onresize event
        window.onresize = function() {
          scope.$apply();
        };

        // Watch for resize event
        scope.$watch(function() {
          return angular.element($window)[0].innerWidth;
        }, function() {
          width = parseInt(d3.select(".bi-widget-body").style('width'), 10);
          svg.attr({
            width: width,
            height: height,
          });
          radius = Math.min(width - 250, height) / 2;
          arc.outerRadius(radius - 10)

          scope.render(values);
        });

        // Watch for data change
        scope.$watch('data', function(newV, oldV) {
          if (newV !== oldV) {
            scope.render(values);
          }
        }, true);

        var arc = d3.svg.arc()
          .innerRadius(0);

        var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) {
            return d.value;
          });

        scope.render = function(data) {
          //Remove previous render
          svg.selectAll('*').remove();

          // Set background
          svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#fff");

          var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + (width / 2 + 120) + "," + height / 2 + ")");

          g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {
              return color(d.data.variable.label);
            })
            .style("opacity", 0.7)
            .on("mouseover", function(d) {
              d3.select(this).style("opacity", 1);
              svg.append("text")
                .attr("class", "bi-widget-highlight-label")
                .attr("x", d3.mouse(svg.node())[0])
                .attr("y", d3.mouse(svg.node())[1])
                .style("font-size", "14px")
                .style("pointer-events", "none")
                .text(d.data.variable.label + ': ' );

              var label = d3.select(".bi-widget-highlight-label")
              var labelWidth = label[0][0].getBoundingClientRect().width;

              svg.append("text")
                .attr("class", "bi-widget-highlight-value")
                .attr("x", function() {
                  var xPos = d3.mouse(svg.node())[0];
                  var rightSpace = width - xPos;
                  if (rightSpace < labelWidth + 50) {
                    label.attr("x", width - labelWidth - 60)
                    return (width - 50);
                  } else {
                    return d3.mouse(svg.node())[0] + labelWidth + 10
                  }
                })
                .attr("y", d3.mouse(svg.node())[1])
                .style("font-size", "16px")
                .style("pointer-events", "none")
                .style("text-shadow", "1px 0 #000")
                .style("font-weight", "bold")
                .text(function() {
                  if (type === 'percentage') {
                    return d.data.value + ' %'
                  } else {
                    return d.data.value
                  }
                })
            })
            .on("mouseout", function() {
              svg.selectAll('.bi-widget-highlight-label').remove();
              svg.selectAll('.bi-widget-highlight-value').remove();
              d3.select(this).style("opacity", 0.7);
            });

          svg.append("text")
            .attr("x", margin.left + 20)
            .attr("y", 40)
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text('Verdeling in ' + data[0].year.getFullYear());

          // Determine legend offset
          legendHeight = values.length * 20;
          legendOffset = (height - legendHeight) / 2 + 10;

          values.forEach(function(d, i) {
            svg.append("circle")
              .attr("class", "dot")
              .attr("r", 5)
              .attr("cx", margin.left)
              .attr("cy", function() { return legendOffset + (20 * i); })
              .style("fill", function() { return color(d.variable.label); })

            svg.append("text")
              .attr("x", margin.left + 20)
              .attr("y", function() { return legendOffset + 5 + (20 * i); })
              .attr("class", "bi-pie-label")
              .style("font-size", "14px")
              .text(d.variable.label + ': ');

            var labels = d3.selectAll(".bi-pie-label");
            var labelWidth = labels[0][i].getBoundingClientRect().width;

            svg.append("text")
              .attr("x", margin.left + labelWidth + 30)
              .attr("y", function() { return legendOffset + 5 + (20 * i); })
              .attr("class", "bi-pie-value")
              .style("font-size", "16px")
              .style("text-shadow", "1px 0 #000")
              .style("font-weight", "bold")
              .text(function() {
                if (type === 'percentage') {
                  return d.value + ' %'
                } else {
                  return d.value
                }
              });
          });

        };
      });
    }};
  });
