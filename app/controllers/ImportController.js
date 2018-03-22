var fs                    = require('fs'),
    csv                   = require('csv'),
    async                 = require('async'),
    Terraformer           = require('terraformer');

var Variable              = require('../models/variable'),
    Theme                 = require('../models/theme'),
    Group                 = require('../models/group'),
    Area                  = require('../models/area'),
    Value                 = require('../models/value');

module.exports            = (function() {

  return {
    geolocation: function(req, res, next) {
      var levelname = req.query.levelname;
      var coords = req.query.coords.split(',');
      var point = new Terraformer.Primitive({
        "type": "Point",
        "coordinates": coords
      });
      var area = {
        'name': '',
        'code': ''
      };
      var match = false;

      Area.find({'levelname': levelname})
      .populate({ path: 'children', select: 'name code -_id'})
      .populate({ path: 'parent', select: 'name code -_id'})
      .exec(function(err, areas) {
        if (err) console.log(err);
        async.each(areas, function(item, callback) {
          var polygon = new Terraformer.Primitive(item.geojson.geometry);
          if (point.within(polygon)) {
            area.name = item.name;
            area.code = item.code;
            match = true;
          }
          callback();
        }, function(err) {
          if (err) console.log(err);
          if (match) {
            res.json(area)
          } else {
            res.json('no matching areas for ' + coords)
          }
        });
      });
    },
    metadata: function(req, res, next) {

      var readStream = fs.createReadStream("./app/assets/metadata.csv");
      var parser = csv.parse({delimiter: ','}, function (err, data) {
        if (err) console.error(err);

        async.eachSeries(data, function(line, callback) {
          if (line[1] === 'THEMA') callback();
          else {
            var lineTheme,
                lineGroup;

            async.waterfall([
              function(callback) {
                Theme.findOne({'name': line[1]}, function(err, theme) {
                  if (err) console.error(err);
                  if (theme) {
                    lineTheme = theme;
                    callback();
                  } else {
                    newTheme = new Theme();
                    newTheme.name = line[1];
                    newTheme.save(function(err, theme) {
                      if (err) console.error(err);
                      lineTheme = theme;
                      callback();
                    });
                  }
                });
              },
              function(callback) {
                if (line[9] === '') callback();
                else {
                  Group.findOne({'name': line[9]}, function(err, group) {
                    if (err) console.error(err);
                    if (group) {
                      lineGroup = group;
                      callback();
                    } else {
                      newGroup = new Group();
                      newGroup.name = line[9];
                      newGroup.theme = lineTheme._id;
                      newGroup.save(function(err, group) {
                        if (err) console.error(err);
                        Theme.findByIdAndUpdate(lineTheme._id, {$push: {'groups': group._id} }, function(err, theme) {
                          if (err) console.error(err);
                          lineGroup = group;
                          callback();
                        })
                      });
                    }
                  });
                }
              },
              function(callback) {
                newVariable = new Variable();
                newVariable.name = line[2];
                newVariable.label = line[3];
                newVariable.definition = line[3];
                newVariable.type = line[8];

                if (line[9] !== '') {
                  newVariable.group = lineGroup._id;
                }
                if (line[9] === '') {
                  newVariable.theme = lineTheme._id;
                }

                newVariable.save(function(err, variable) {
                  if (err) console.error(err);
                  if (variable.group === undefined) {
                    Theme.findByIdAndUpdate(lineTheme._id, {$push: {'variables': variable._id}}, function(err, theme) {
                      if (err) console.error(err);
                      callback();
                    });
                  } else {
                    Group.findByIdAndUpdate(lineGroup._id, {$push: {'variables': variable._id}}, function(err, group) {
                      if (err) console.error(err);
                      callback();
                    });
                  }
                });
              }
            ], function(err, results) {
              callback();
            });
          }
        }, function(err) {
          if (err) console.error(err);

          res.json('all done')
        });

      });

      readStream.pipe(parser);
    },
    areas: function(req, res, next) {

      var readStream = fs.createReadStream("./app/assets/gebieden2015.csv");
      var parser = csv.parse({delimiter: ';'}, function (err, data) {
        if (err) console.error(err);

        async.eachSeries(data, function(line, callback) {
          if (line[0] === 'gebiedcode' || line[18] === '27geb' || line[18] === 'altbrt' || line[18] === 'rayon' || line[1] === 'onbekend') callback();
          else {
            console.log(line[1]);
            newArea = new Area();
            newArea.name = line[1];
            newArea.code = line[0];
            newArea.codename = line[2];
            newArea.levelname = line[17];
            if (line[3]) newArea.sdcode = line[3];
            if (line[4]) newArea.sdname = line[4];

            if (line[18] === 'stad') {
              newArea.save(function(err, area) {
                callback();
              });
            }

            if (line[18] === 'sd') {
              Area.findOne({'code': 'STAD'}, function(err, parent) {
                if (err) console.error(err);
                newArea.parent = parent._id;
                newArea.save(function(err, area) {
                  Area.findByIdAndUpdate(parent._id, {$push: {'children': area._id}}, function(err, parent) {
                    if (err) console.error(err);
                    callback();
                  });
                });
              });
            }

            if (line[18] === '22geb') {
              Area.findOne({'code': line[3]}, function(err, parent) {
                if (err) console.error(err);
                newArea.parent = parent._id;
                newArea.save(function(err, area) {
                  Area.findByIdAndUpdate(parent._id, {$push: {'children': area._id}}, function(err, parent) {
                    if (err) console.error(err);
                    callback();
                  });
                });
              });
            }

            if (line[18] === 'bctk') {
              Area.findOne({'code': line[5]}, function(err, parent) {
                if (err) console.error(err);
                newArea.parent = parent._id;
                newArea.save(function(err, area) {
                  Area.findByIdAndUpdate(parent._id, {$push: {'children': area._id}}, function(err, parent) {
                    if (err) console.error(err);
                    callback();
                  });
                });
              });
            }
            if (line[18] === 'brtk') {
              Area.findOne({'code': line[9]}, function(err, parent) {
                if (err) console.error(err);
                newArea.parent = parent._id;
                newArea.save(function(err, area) {
                  Area.findByIdAndUpdate(parent._id, {$push: {'children': area._id}}, function(err, parent) {
                    if (err) console.error(err);
                    callback();
                  });
                });
              });
            }
          }
        }, function(err) {
          if (err) console.error(err);
          res.json('all done')
        });

      });

      readStream.pipe(parser);
    },
    geojson: function(req, res, next) {

      async.waterfall([
        function(callback) {
          fs.readFile('./app/assets/geojson/sd.geojson', function(err, data) {
            if (err) { console.error(err); }
            json =  JSON.parse(data);

            async.eachSeries(json.features, function(item, callback) {
              Area.findOne({'code': item.properties.Stadsdeel_}, function(err, area) {
                if (err) console.error(err);
                if (!area) {
                  console.log(item.properties.Stadsdeel_ + ' not found!');
                  callback();
                }
                else {
                  area.geojson = item;
                  area.save(function(err) {
                    if (err) console.error(err);
                    callback();
                  });
                }
              });
            }, function(err) {
              if (err) console.error(err);
              callback()
            })
          });
        },
        function(callback) {
          fs.readFile('./app/assets/geojson/22geb.geojson', function(err, data) {
            if (err) { console.error(err); }
            json =  JSON.parse(data);

            async.eachSeries(json.features, function(item, callback) {
              Area.findOne({'code': item.properties.Gebied_cod}, function(err, area) {
                if (err) console.error(err);
                if (!area) {
                  console.log(item.properties.Gebied_cod + ' not found!');
                  callback();
                }
                else {
                  area.geojson = item;
                  area.save(function(err) {
                    if (err) console.error(err);
                    callback();
                  });
                }
              });
            }, function(err) {
              if (err) console.error(err);
              callback()
            })
          });
        },
        function(callback) {
          fs.readFile('./app/assets/geojson/bctk.geojson', function(err, data) {
            if (err) { console.error(err); }
            json =  JSON.parse(data);

            async.eachSeries(json.features, function(item, callback) {
              Area.findOne({'code': item.properties.Buurtcombi}, function(err, area) {
                if (err) console.error(err);
                if (!area) {
                  console.log(item.properties.Buurtcombi + ' not found!');
                  callback();
                }
                else {
                  area.geojson = item;
                  area.save(function(err) {
                    if (err) console.error(err);
                    callback();
                  });
                }
              });
            }, function(err) {
              if (err) console.error(err);
              callback()
            })
          });
        },
        function(callback) {
          fs.readFile('./app/assets/geojson/brtk.geojson', function(err, data) {
            if (err) { console.error(err); }
            json =  JSON.parse(data);

            async.eachSeries(json.features, function(item, callback) {
              Area.findOne({'code': item.properties.Buurt_code}, function(err, area) {
                if (err) console.error(err);
                if (!area) {
                  console.log(item.properties.Buurt_code + ' not found!');
                  callback();
                }
                else {
                  area.geojson = item;
                  area.save(function(err) {
                    if (err) console.error(err);
                    callback();
                  });
                }
              });
            }, function(err) {
              if (err) console.error(err);
              callback()
            })
          });
        }
      ], function(err, results) {
        if (err) console.error(err);
        return res.json('done')
      })

    },
    values: function(req, res, next) {
      var readStream = fs.createReadStream("./app/assets/bbga2016.csv");
      var parser = csv.parse({delimiter: ';'}, function (err, data) {
        if (err) console.error(err);

        async.eachSeries(data, function(line, callback) {
          var lineArea;
          var lineVariable;

          Area.findOne({'code': line[1]}, function(err, area) {
            if (err) console.error(err);
            else if (!area) {
              console.log(line[1] + ' not found!');
              callback();
            }
            else {
              lineArea = area;
              Variable.findOne({'name': line[2]}, function(err, variable) {
                if (err) console.error(err);
                else if (!variable) {
                  console.log(line[2] + ' for ' + line[1] + ' not found!');
                  callback();
                }
                else {
                  lineVariable = variable;

                  var newValue = new Value();
                  newValue.variable = lineVariable._id;
                  newValue.value = line[3];
                  newValue.year = line[0];
                  newValue.area = lineArea._id;
                  newValue.save(function(err, value) {
                    if (err) console.error(err);
                    console.log(line[2] + ' for ' + line[1] + ' added!');
                    callback();
                  });
                }
              });
            }
          });
        }, function(err) {
          if (err) console.error(err);
          res.json('all done')
        });
      });

      readStream.pipe(parser);
    }
  }


})();
