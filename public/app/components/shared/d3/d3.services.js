angular.module('app.services')

.factory('WrapService', function() {

  this.wrap = function(text, width) {

    text.each(function() {
      var text = d3.select(this),
          width = 140,
          words = text.text().split(/\s+/).reverse(),
          word,
          line = [],
          lineNumber = 0, //<-- 0!
          lineHeight = 1.2, // ems
          x = text.attr("x"), //<-- include the x!
          y = text.attr("y"),
          dy = text.attr("dy") ? text.attr("dy") : 0; //<-- null check
          tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  };

  return this;
})

.factory('GraphService', function($rootScope) {

  this.getNL = function() {
    var NL = d3.locale({
      "decimal": ",",
      "thousands": ".",
      "grouping": [3],
      "currency": ["€", ""],
      "dateTime": "%a %b %e %X %Y",
      "date": "%d-%m-%Y",
      "time": "%H:%M:%S",
      "periods": ["AM", "PM"],
      "days": ["zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag"],
      "shortDays": ["zo", "ma", "di", "wo", "do", "vr", "za"],
      "months": ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
      "shortMonths": ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
    });

    return NL;
  };

  this.sortByKey = function(array, key) {
    return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  };

  this.sortByOrder = function(array, areas) {
    var sortedArray = []
    var areas = areas.split(',')

    // Add the remaining area's in the correct order to the new array
    for (var i = 0; i < areas.length; i++) {
      var compareIndex = array.map(function(d) { return d['areacode']; }).indexOf(areas[i]);
      sortedArray.push(array[compareIndex])
    }

    return sortedArray
  };

  return this;

})
