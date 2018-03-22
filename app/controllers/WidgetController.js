var async                 = require('async');

var Area                  = require('../models/area'),
    Comment               = require('../models/comment'),
    Group                 = require('../models/group'),
    Variable              = require('../models/variable'),
    Value                 = require('../models/value');

module.exports            = (function() {

  // ============================ VALUE =============================
  return {
    variable: function(req, res, next) {
      var variable = req.query.variable;
      var area = req.query.area;
      var params = {
        year: 0,
      };
      var result = {};

      async.waterfall([
        function(callback) {
          Variable.findOne({'name': variable})
            .exec(function(err, variable) {
              params['variable'] = variable._id;
              result['variable'] = {
                id: variable._id,
                name: variable.name,
                label: variable.label,
                definition: variable.definition,
                type: variable.type
              }
              callback();
            });
        },
        function(callback) {
          Area.findOne({'code': req.query.area})
          .populate({ path: 'children', select: 'name code geojson sdname _id'})
            .exec(function(err, area) {
              params['area'] = area._id;
              params['children'] = area.children;
              params['district'] = area.sdname;
              result['area'] = {
                name: area.name,
                code: area.code,
                geojson: area.geojson
              }
              callback();
            });
        },
        function(callback) {
          Value.find({'variable': params.variable, 'area': params.area})
            .exec(function(err, values) {
              if (err) console.error(err);
              var valueArray = []
              for (var i = 0; i < values.length; i++) {
                valueArray.push({ 'area': result['area'].name, 'value': parseInt(values[i].value), 'year': values[i].year });
                if (values[i].year > params.year) params.year = values[i].year;
              }
              valueArray.sort(function(a, b) {
                var x = a['year']; var y = b['year'];
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
              });
              // result['values'] = valueArray.slice(1).slice(-5);
              result['values'] = valueArray
              callback();
            });
        },
        function(callback) {
          var childrenArray = [];
          async.each(params.children, function(child, callback) {
            Value
              .findOne({'variable': params.variable, 'area': child._id, 'year': params.year })
              .exec(function(err, value) {
                if (value === null) {
                  childrenArray.push({ 'name': child.name, 'code':child.code, 'geojson': child.geojson, 'value': 'Geen data', 'year': params.year });
                } else {
                  childrenArray.push({ 'name': child.name, 'code':child.code, 'geojson': child.geojson, 'value': parseInt(value.value), 'year': params.year });
                }
                callback();
              });
          }, function(err) {
            if (err) console.error(err);
            result['children'] = childrenArray;
            callback();
          })
        },
        function(callback) {
          var districtArray = [];
          Area
            .find({'levelname' : '22 gebieden', 'sdname':params.district})
            .select('name code geojson _id')
            .exec(function(err, gebieden) {
              if(err) console.error(err);
              async.each(gebieden, function(gebied, callback) {
                Value
                  .findOne({'variable': params.variable, 'area': gebied._id, 'year': params.year})
                  .exec(function(err, value) {
                    if (value === null) {
                      districtArray.push({ 'name': gebied.name, 'code':gebied.code, 'geojson': gebied.geojson, 'value': 'Geen data', 'year': params.year });
                    } else {
                      districtArray.push({ 'name': gebied.name, 'code':gebied.code, 'geojson': gebied.geojson, 'value': parseInt(value.value), 'year': params.year });
                    }
                    callback();
                });
              }, function(err) {
                if (err) console.error(err);
                result['district'] = districtArray;
                callback();
              });
            })
        },
        function(callback) {
          var cityArray = [];
          Area
            .find({'levelname' : 'Stadsdelen'})
            .select('name code geojson _id')
            .exec(function(err, stadsdelen) {
              if(err) console.error(err);
              async.each(stadsdelen, function(stadsdeel, callback) {
                Value
                  .findOne({'variable': params.variable, 'area': stadsdeel._id, 'year': params.year})
                  .exec(function(err, value) {
                    if (value === null) {
                      cityArray.push({ 'name': stadsdeel.name, 'code':stadsdeel.code, 'geojson': stadsdeel.geojson, 'value': 'Geen data', 'year': params.year });
                    } else {
                      cityArray.push({ 'name': stadsdeel.name, 'code':stadsdeel.code, 'geojson': stadsdeel.geojson, 'value': parseInt(value.value), 'year': params.year });
                    }
                    callback();
                });
              }, function(err) {
                if (err) console.error(err);
                result['city'] = cityArray;
                callback();
              });
            })
        }
      ], function(err, response) {
        if (err) console.error(err);
        res.json(result);
      });
    },
    group: function(req, res, next) {
      var group = req.query.group;
      var area = req.query.area;
      var params = {
        year: 0,
      };
      var result = {};

      async.waterfall([
        function(callback) {
          Group.findOne({'name': group})
            .populate({ path: 'variables', select: 'name type _id'})
            .exec(function(err, group) {
              params['group'] = group._id;
              params['variables'] =[];
              result['group'] = {
                id: group._id,
                name: group.name,
                label: group.label,
              }
              result['values'] = [];
              var types = [];
              for (var i = 0; i < group.variables.length; i++) {
                if (types.indexOf(group.variables[i].type) < 0) {
                  types.push(group.variables[i].type)
                }
              }

              if (types.indexOf(1) !== -1) {
                for (var i = 0; i < group.variables.length; i++) {
                  if (group.variables[i].type === 1) {
                    params.variables.push(group.variables[i])
                  }
                }
                result['type'] = 'percentage';
              } else if (types.indexOf(2) !== -1) {
                for (var i = 0; i < group.variables.length; i++) {
                  // console.log(group.variables[i].type);
                  if (group.variables[i].type === 2) {
                    params.variables.push(group.variables[i])
                  }
                }
                result['type'] = 'absolute';
              }
              callback();
            });
        }, function(callback) {
          Area.findOne({'code': req.query.area})
          .populate({ path: 'children', select: 'name code geojson sdname _id'})
            .exec(function(err, area) {
              params['area'] = area._id;
              params['children'] = area.children;
              params['district'] = area.sdname;
              result['area'] = {
                name: area.name,
                code: area.code,
                geojson: area.geojson
              }
              callback();
            });
        }, function(callback) {
          async.each(params.variables, function(variable, callback) {
            Value
              .find({'variable': variable._id, 'area': params.area })
              .select('value variable year -_id')
              .populate({ path: 'variable', select: 'name label -_id'})
              .exec(function(err, values) {
                for (var i =0; i < values.length; i++) {
                  result.values.push(values[i])
                }
                callback();
              });
          }, function(err) {
            if (err) console.error(err);
            callback()
          })
        }
      ], function(err, response) {
        if (err) console.error(err);
        res.json(result);
      });
    },
    sumbitFeedback: function(req, res, next) {
      var newComment = new Comment();
      newComment.option = req.body.option;
      newComment.text = req.body.text;
      newComment.date = new Date();
      if (req.body.variable) newComment.variable = req.body.variable;
      if (req.body.group) newComment.group = req.body.group;

      newComment.save(function(err, comment) {
        if (err) console.error(err);

        if (comment.variable) {
          Variable.update( {'_id': comment.variable}, {$push: {comments: comment._id}}, function(err) {
            if (err) console.error(err);
          });
        }

        if (comment.group) {
          Group.update( {'_id': comment.group}, {$push: {comments: comment._id}}, function(err) {
            if (err) console.error(err);
          });
        }

        res.send(comment)
      });
    }
  }
})();
