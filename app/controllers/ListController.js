var async                 = require('async');

var Variable              = require('../models/variable'),
    Theme                 = require('../models/theme'),
    Group                 = require('../models/group'),
    Area                  = require('../models/area'),
    Marker                  = require('../models/marker'),
    Value                 = require('../models/value');

module.exports            = (function() {

  // ============================ THEMES ============================

  return {
    themes: function(req, res, next) {
      Theme.find({})
      .select('name variables groups')
      .populate({ path: 'groups', select: 'name label variables -_id'})
      .populate({ path: 'variables', select: 'name label definition -_id'})
      .exec(function(err, themes) {
        var options = {
          path: 'groups.variables',
          model: 'Variable',
          select: 'label name -_id'
        }
        Theme.populate(themes, options, function(err, variables) {
          res
            .set({'Content-Type': 'application/json; charset=utf-8'})
            .status(200)
            .send(JSON.stringify(themes, undefined, ' '));
        });
      });
    },
    themeById: function(req, res, next) {
      Theme.findById(req.params.id)
      .select('name groups variables')
      .populate({ path: 'groups', select: 'name label variables -_id'})
      .populate({ path: 'variables', select: 'name label definition -_id'})
      .exec(function(err, themes) {
        var options = {
          path: 'groups.variables',
          model: 'Variable',
          select: 'label name -_id'
        }

        Theme.populate(themes, options, function(err, variables) {
          res
            .set({'Content-Type': 'application/json; charset=utf-8'})
            .status(200)
            .send(JSON.stringify(themes, undefined, ' '));
        });
      });
    },
    themeByName: function(req, res, next) {
      Theme.findOne({'name': req.params.name})
      .select('name groups variables')
      .populate({ path: 'groups', select: 'name label variables -_id'})
      .populate({ path: 'variables', select: 'name label definition -_id'})
      .exec(function(err, themes) {
        var options = {
          path: 'groups.variables',
          model: 'Variable',
          select: 'label name -_id'
        }

        Theme.populate(themes, options, function(err, variables) {
          res
            .set({'Content-Type': 'application/json; charset=utf-8'})
            .status(200)
            .send(JSON.stringify(themes, undefined, ' '));
        });
      });
    },

  // ============================ GROUPS ============================

    groups: function(req, res, next) {
      Group.find({})
      .select('name label theme variables')
      .populate({ path: 'theme', select: 'name -_id'})
      .populate({ path: 'variables', select: 'name label -_id'})
      .exec(function(err, groups) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(groups, undefined, ' '));
      });
    },
    groupById: function(req, res, next) {
      Group.findById(req.params.id)
      .select('name label theme variables')
      .populate({ path: 'theme', select: 'name -_id'})
      .populate({ path: 'variables', select: 'name label -_id'})
      .exec(function(err, groups) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(groups, undefined, ' '));
      });
    },

    // ============================ AREA ============================

    areas: function(req, res, next) {
      Area.find({})
      .select('name code codename children parent')
      .populate({ path: 'parent', select: 'name -_id'})
      .populate({ path: 'children', select: 'name -_id'})
      .exec(function(err, areas) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(areas, undefined, ' '));
      });
    },
    areaById: function(req, res, next) {
      Area.findById(req.params.id)
      .select('name geojson code levelname children parent')
      .populate({ path: 'parent', select: 'name -_id'})
      .populate({ path: 'children', select: 'name -_id'})
      .exec(function(err, area) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(area, undefined, ' '));
      });
    },
    areaByLevel: function(req, res, next) {
      Area.find({'levelname': req.params.level})
      .select('name geojson code children')
      .populate({ path: 'children', select: 'name'})
      .exec(function(err, areas) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(areas, undefined, ' '));
      });
    },
    areasByCode: function(req, res, next) {
      var areas = req.params.areas.split(',')

      Area.find({'code': { $in: areas }})
      .select('name geojson code levelname children parent')
      .populate({ path: 'parent', select: 'name -_id'})
      .populate({ path: 'children', select: 'name -_id'})
      .exec(function(err, area) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(area, undefined, ' '));
      });
    },
    // ========================== VARIABLES =========================

    variables: function(req, res, next) {
      Variable.find({})
      .select('name theme group definition label')
      .populate({ path: 'theme', select: 'name -_id'})
      .populate({ path: 'group', select: 'name -_id'})
      .exec(function(err, variables) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(variables, undefined, ' '));
      });
    },
    variableById: function(req, res, next) {
      Variable.findById(req.params.id)
      .select('name theme group definition label -_id')
      .populate({ path: 'theme', select: 'name -_id'})
      .populate({ path: 'group', select: 'name -_id'})
      .exec(function(err, variable) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(variable, undefined, ' '));
      });
    },
    variableByName: function(req, res, next) {
      Variable.findOne({'name': req.params.name})
      .select('name theme group definition label -_id')
      .populate({ path: 'theme', select: 'name -_id'})
      .populate({ path: 'group', select: 'name -_id'})
      .exec(function(err, variable) {
        res
          .set({'Content-Type': 'application/json; charset=utf-8'})
          .status(200)
          .send(JSON.stringify(variable, undefined, ' '));
      });
    },
    variableByTheme: function(req, res, next) {
      Theme.findOne({'name': req.params.theme})
      .select('_id')
      .exec(function(err, theme) {
        Variable.find({'theme': theme })
        .select('name group location definition label -_id')
        .populate({ path: 'group', select: 'name -_id'})
        .exec(function(err, variables) {
          res
            .set({'Content-Type': 'application/json; charset=utf-8'})
            .status(200)
            .send(JSON.stringify(variables, undefined, ' '));
        });
      });
    },

    // ============================ VALUE ===========================

    values: function(req, res, next) {
      Value.find({})
        .select('year value area variable -_id')
        .populate({ path: 'area', select: 'codename -_id'})
        .populate({ path: 'variable', select: 'label -_id'})
        .exec(function(err, values) {
          res.json(values)
        });
    },
    valuesByCards: function(req, res, next) {
      if (!req.query.areas || !req.query.theme) { res.json([]); }


      var results = [],
          areas = req.query.areas.split(','),
          theme = req.query.theme,
          themeString = {},
          areaString = {},
          variables = [],
          groups = [];
         //console.log(areas)
      // Execute in specific order
      async.waterfall([
        // Determine all the groups and variables to be retrieved
        function(callback) {
          switch(theme) {
            case 'BW':
              themeString = { $in: ['57287278b015e9a00e1b27b8', '57287278b015e9a00e1b2801', '57287278b015e9a00e1b2832'] };
              break;
            case 'OE':
              themeString = { $in: ['57287279b015e9a00e1b28af', '57287279b015e9a00e1b29a0', '57287279b015e9a00e1b2986', '57287279b015e9a00e1b29b0'] };
              break;
            case 'RS':
              themeString = { $in: ['57287279b015e9a00e1b285a', '57287279b015e9a00e1b2874', '57287279b015e9a00e1b2962', '57287279b015e9a00e1b296a'] };
              break;
            case 'LV':
              themeString = { $in: ['57287279b015e9a00e1b287d', '57287279b015e9a00e1b2892'] };
             break;
            case 'EN':
              themeString = { $in: ['588f2ad888dba01b284ec100'] };
             break;
          }

          Theme.find({'_id': themeString})
          .select('name variables groups')
          .exec(function(err, themes) {
            console.log(themes)
            for (var i = 0; i < themes.length; i++) {
              for (var j = 0; j < themes[i].variables.length; j++) {
                variables.push(themes[i].variables[j].toString());
              }
              for (var k = 0; k < themes[i].groups.length; k++) {
                groups.push(themes[i].groups[k].toString())
              }
            }
            callback();
          });
        },
        // Determine the areaString based on id's
        function(callback) {
          var areaArray = [];

          async.eachSeries(areas, function(area, callback) {
            Area.findOne({'code': area})
            .select('_id')
            .exec(function(err, result) {
              if (err) console.error(err);
              areaArray.push(result.id)
              callback();
            })
          }, function(err) {
            if (err) console.error(err);
            areaString = { $in: areaArray };
            callback();
          })

        },
        function(callback) {
          var year = 2016;
          var count = variables.length;

          // Retrieve variable values from latest year in which all areas were available
          async.whilst(
            function() { return count > 0; },
            function(callback) {
              async.each(variables, function(item, callback) {
                console.log(areaString);
                Value.find({ 'area': areaString, 'variable': item, 'year': year.toString() })
                  .select('year variable value area -_id')
                  .populate({ path: 'area', select: 'code name _id' })
                  .populate({ path: 'variable', select: 'label definition location type name _id' })
                  .exec(function(err, values) {
                   
                    values.sort((a, b) => areaString['$in'].findIndex(id => a.area._id.equals(id)) - areaString['$in'].findIndex(id => b.area._id.equals(id)));
               
                    if (values.length === areas.length) {
                      variableData = {
                        _id: values[0].variable._id,
                        definition: values[0].variable.definition,
                        label: values[0].variable.label,
                        name: values[0].variable.name,
                        type: values[0].variable.type,
                        year: values[0].year,
                        group: false,
                        location: values[0].variable.location,
                        areas: []
                      }

                      for (var i = 0; i < values.length; i++) {
                        var valueData = {
                          area: values[i].area.name,
                          areacode: values[i].area.code,
                          value: values[i].value,
                        }

                        variableData['areas'].push(valueData)
                      }

                      results.push(variableData);
                     
                      var index = variables.indexOf(values[0].variable._id.toString());
                      variables.splice(index, 1);
                    }
                    callback();
                });
              }, function(err) {
                count = variables.length;
                year--;
                // Escape loop when data is less than 2005 (Start of BBGA)
                if (year < 2005) {
                  count = 0;
                }
                callback(null, count);
              });
            },
            function (err) {
              callback();
            }
          );
        },
        // Retrieve group values from latest year in which all areas were available
        function(callback) {
          async.eachSeries(groups, function(item, callback) {
            Group.findById(item)
            .select('variables name label definition type')
            .exec(function(err, group) {
              // Get most recent measurement
              var loopCount = 0
              var variable = group.variables[loopCount];
              var groupVariables = [];
              var year = 2016;
              var count = 1;


              groupData = {
                _id: group._id,
                label: group.label,
                definition: group.definition,
                name: group.name,
                type: group.type,
                year: year,
                group: true,
                variables: []
              }

              async.whilst(
                function() { return count > 0; },
                function(callback) {
       
                  console.log(variable)
                  console.log(areaString)
                  console.log(year)
                  Value.findOne({ 'area': areaString, 'variable': variable, 'year': year.toString() })
                    .select('_id')
                    .exec(function(err, values) {
                      if (values) {
                        groupData.year = year;
                        count = 0;
                      } else {
                        if(loopCount == group.variables.length){
                            year--;
                            loopCount = 0
                        }else{
                           loopCount++
                        }
                        variable = group.variables[loopCount]
                      
                       

                        // Escape loop when data is less than 2005 (Start of BBGA)
                        if (year < 2005) {

                          count = 0;
                        }
                      }
                      callback(null, count);
                    });
                }, function(err) {
                  // Get values for the most recent year
                  async.each(group.variables, function(item, callback) {
                    Value.find({ 'area': areaString, 'variable': item, 'year': year.toString() })
                      .select('year variable value area -_id')
                      .populate({ path: 'area', select: 'code name _id' })
                      .populate({ path: 'variable', select: 'label definition name type _id' })
                      .exec(function(err, values) {

                 
                        values.sort((a, b) => areaString['$in'].findIndex(id => a.area._id.equals(id)) - areaString['$in'].findIndex(id => b.area._id.equals(id)));
                   
                        for (var i = 0; i < values.length; i++) {
                          var index = groupData.variables.map(function(d) { return d['_id']; }).indexOf(values[i].variable._id);
                          if (index === -1) {
                            groupData.variables.push({
                              _id: values[i].variable._id,
                              label: values[i].variable.label,
                              definition: values[i].variable.definition,
                              name: values[i].variable.name,
                              type: values[i].variable.type,
                              areas: [{ area: values[i].area.name, areacode: values[i].area.code, value: values[i].value }]
                            })
                          } else {
                            groupData.variables[index].areas.push({ area: values[i].area.name, areacode: values[i].area.code, value: values[i].value })
                          }
                        }
                        callback();
                    });
                  }, function(err) {
                    if (err) console.error(err);
                    if (groupData.variables.length > 0) {
                      results.push(groupData)
                    }
                    callback();
                  });
              });

            });
          }, function(err) {
            callback();
          })
        },
      ], function(err, response) {
        if(err) console.error(err);
        res.json(results)
      });
    },
    valueByCode: function(req, res, next) {
      Area.findOne({'code': req.params.code})
        .select('name _id')
        .exec(function(err, area) {
          Value.find({'area': area._id, 'year': '2016'})
          .select('year value variable -_id')
          .populate({ path: 'variable', select: 'label -_id'})
          .exec(function(err, values) {
            res.json(values)
          });
        });
    },
    valuesBySingle: function(req, res, next) {
      var params = {}
      var results = [];
      async.waterfall([
        function(callback) {
          Variable.findOne({'name': req.query.variable})
            .select('_id')
            .exec(function(err, variable) {
              params['variable'] = variable._id
              callback();
            });
        },
        function(callback) {
          Area.findOne({'code': req.query.area})
            .select('_id')
            .exec(function(err, area) {
              params['area'] = area._id
              callback();
            });
        }
      ], function(err, response) {
        if (err) console.error(err);
        Value.find({'variable': params.variable, 'area': params.area})
          .populate({ path: 'area', select: 'name levelname -_id'})
          .populate({ path: 'variable', select: 'label definition -_id' })
          .exec(function(err, values) {
            if (err) console.error(err);
            var mostRecent = 0;

            for (i = 0; i < values.length; i++) {
              if (values[i].year > values[mostRecent].year) mostRecent = i;
            }

            res.json(values[mostRecent]);
          })
      });
    },
    valuesByDetail: function(req, res, next) {

      if (!req.query.areas || !req.query.var) { res.json([]); }
      //CHECK IF VAR IS PART of LIST with markers -> if so...markers=true
      markerDataArray = ['ZPT']
      if(markerDataArray.indexOf(req.query.var) >= 0){
        markers = true;
      }else{
        markers = false;
      }
      
      var results = {},
          areas = req.query.areas.split(','),
          isVariable = true,
          areaString = {};

      if (req.query.var.substr(req.query.var.length - 3) === 'GRP') isVariable = false;

      async.waterfall([
        function(callback) {
          var areaArray = [];

          async.eachSeries(areas, function(area, callback) {
            Area.findOne({'code': area})
            .select('_id')
            .exec(function(err, result) {
              if (err) console.error(err);
              areaArray.push(result.id)
              callback();
            })
          }, function(err) {
            if (err) console.error(err);
            areaString = { $in: areaArray };
            callback();
          })
        },
        function(callback) {
          if (isVariable) {
            // Find Variable based on name
            Variable.findOne({'name': req.query.var})
              .select('label definition type name _id')
              .exec(function(err, variable) {
                // Store results in JSON
                variableData = {
                  _id: variable._id,
                  definition: variable.definition,
                  label: variable.label,
                  name: variable.name,
                  type: variable.type,
                  group: false,
                  markers:markers,
                  areas: [],
                  markerData: []
                }
                // Find the value for the areas
                Value.find({ 'area': areaString, 'variable': variableData._id })
                  .select('year variable value area -_id')
                  .populate({ path: 'area', select: 'code name -_id' })
                  .populate({ path: 'variable', select: 'label definition type name _id' })
                  .exec(function(err, values) {
                    for (var i = 0; i < values.length; i++) {
                      // Check if area is already added to the variable
                      var index = variableData.areas.map(function(d) { return d['areacode']; }).indexOf(values[i].area.code);
                      // If not found create new array entry
                      if (index === -1) {
                        variableData.areas.push({
                          area: values[i].area.name,
                          areacode: values[i].area.code,
                          values: [{
                            value: values[i].value,
                            year: values[i].year
                          }]
                        })
                      } else {
                        // Append to area array on correct position
                        variableData.areas[index].values.push({
                          value: values[i].value,
                          year: values[i].year
                        })
                      }
                    }
                    if(markers == true){
                      
                      Marker.find({ 'area': areaString, 'variable': variableData._id })
                        .select('lat lng variable area -_id')
                        .populate({ path: 'area', select: 'code name -_id' })
                        .populate({ path: 'variable', select: 'label definition type name _id' })
                        .exec(function(err, markersColl) {
                           for (var i = 0; i < markersColl.length; i++) {
                            // Check if area is already added to the variable
                            var index = variableData.markerData.map(function(d) { return d['areacode']; }).indexOf(markersColl[i].area.code);
                            // If not found create new array entry
                            if (index === -1) {
                              variableData.markerData.push({
                                area: markersColl[i].area.name,
                                areacode: markersColl[i].area.code,
                                values: [{
                                  lat: markersColl[i].lat,
                                  lng: markersColl[i].lng
                                }]
                              })
                            } else {
                              variableData.markerData[index].values.push({
                                lat: markersColl[i].lat,
                                lng: markersColl[i].lng
                              })
                            }
                          }
                          
                          results = variableData;
                          callback();
                      });
                      
                    }else{
                      results = variableData;
                      callback();
                    }
                    
                });
              });
          }

          if (!isVariable) {
            // Find Group based on name
            Group.findOne({'name': req.query.var})
            .select('variables name label definition type')
            .exec(function(err, group) {
              // Store results in JSON
              groupData = {
                _id: group._id,
                label: group.label,
                definition: group.definition,
                name: group.name,
                type: group.type,
                group: true,
                markers:markers,
                years: []
              }

              // Find the values for every variable in the group for the areas
              async.each(group.variables, function(variable, callback) {
                Value.find({ 'area': areaString, 'variable': variable})
                .select('year variable value area -_id')
                .populate({ path: 'area', select: 'code name -_id' })
                .populate({ path: 'variable', select: 'label definition name -_id' })
                .exec(function(err, values) {
                  for (var i = 0; i < values.length; i++) {
                    console.log(values)
                    // Check if year is already added to the group
                    var yearIndex = groupData.years.map(function(d) { return d['year'].toString(); }).indexOf(values[i].year);
                 
                    // If not found create new array entry
                    if (yearIndex === -1) {
                      groupData.years.push({
                        year: parseInt(values[i].year),
                        areas: [{
                          area: values[i].area.name, areacode: values[i].area.code, values: [{
                            label: values[i].variable.label,
                            definition: values[i].variable.definition,
                            name: values[i].variable.name,
                            value: parseFloat(values[i].value),
                          }]
                        }]
                      })
                    } else {
                      // Append to area array on correct position
                      // Check if area is already added to the variable array
                      var areaIndex = groupData.years[yearIndex].areas.map(function(d) { return d['areacode']; }).indexOf(values[i].area.code);
                      // If not found create new array entry
                      if (areaIndex === -1) {
                        groupData.years[yearIndex].areas.push({
                          area: values[i].area.name, areacode: values[i].area.code, values: [{
                            label: values[i].variable.label,
                            definition: values[i].variable.definition,
                            name: values[i].variable.name,
                            value: parseFloat(values[i].value),
                          }]
                        });
                      } else {
                        // Append to area array on correct position
                        groupData.years[yearIndex].areas[areaIndex].values.push({
                          label: values[i].variable.label,
                          definition: values[i].variable.definition,
                          name: values[i].variable.name,
                          value: parseFloat(values[i].value),
                        })
                      }
                    }
                  }

                  callback();
                });
              }, function(err) {
                if (err) console.error(err);

                results = groupData;
                
                callback();
              });
            });

          }

          // if (!isVariable) {
          //   // Find Group based on name
          //   Group.findOne({'name': req.query.var})
          //   .select('variables name label definition type')
          //   .exec(function(err, group) {
          //     // Store results in JSON
          //     groupData = {
          //       _id: group._id,
          //       label: group.label,
          //       definition: group.definition,
          //       name: group.name,
          //       type: group.type,
          //       group: true,
          //       variables: []
          //     }
          //
          //     // Find the values for every variable in the group for the areas
          //     async.each(group.variables, function(variable, callback) {
          //       Value.find({ 'area': areaString, 'variable': variable})
          //       .select('year variable value area -_id')
          //       .populate({ path: 'area', select: 'code name -_id' })
          //       .populate({ path: 'variable', select: 'label definition type name _id' })
          //       .exec(function(err, values) {
          //         for (var i = 0; i < values.length; i++) {
          //           // Check if variable is already added to the group
          //           var varIndex = groupData.variables.map(function(d) { return d['_id']; }).indexOf(values[i].variable._id);
          //           // If not found create new array entry
          //           if (varIndex === -1) {
          //             groupData.variables.push({
          //               _id: values[i].variable._id,
          //               label: values[i].variable.label,
          //               definition: values[i].variable.definition,
          //               name: values[i].variable.name,
          //               type: values[i].variable.type,
          //               areas: [{
          //                 area: values[i].area.name, areacode: values[i].area.code, values: [{
          //                   year: parseInt(values[i].year),
          //                   value: parseFloat(values[i].value),
          //                 }]
          //               }]
          //             })
          //           } else {
          //             // Append to area array on correct position
          //             // Check if area is already added to the variable array
          //             var areaIndex = groupData.variables[varIndex].areas.map(function(d) { return d['areacode']; }).indexOf(values[i].area.code);
          //             // If not found create new array entry
          //             if (areaIndex === -1) {
          //               groupData.variables[varIndex].areas.push({
          //                 area: values[i].area.name, areacode: values[i].area.code, values: [{
          //                   year: parseInt(values[i].year),
          //                   value: parseFloat(values[i].value),
          //                 }]
          //               });
          //             } else {
          //               // Append to area array on correct position
          //               groupData.variables[varIndex].areas[areaIndex].values.push({
          //                 year: parseInt(values[i].year),
          //                 value: parseFloat(values[i].value),
          //               })
          //             }
          //           }
          //         }
          //
          //         callback();
          //       });
          //     }, function(err) {
          //       if (err) console.error(err);
          //
          //       results = groupData;
          //       callback();
          //     });
          //   });
          //
          // }
        },
      ], function(err, response) {
        if(err) console.error(err);
        res.json(results)
      });

    //
    //   if (req.query.type === 'single') {
    //     // Create JSON for results
    //     var results = {
    //       variable: '',
    //       values: '',
    //       area: '',
    //     }
    //
    //     // Run through queries in fixed order
    //     async.waterfall([
    //       function(callback) {
    //         // Find area based on code, select code name and objectId
    //         Area.findOne({'code': req.query.area})
    //           .select('code name _id')
    //           .exec(function(err, area) {
    //             // Store results in JSON
    //             results.area = area;
    //             callback();
    //         });
    //       },
    //       function(callback) {
    //         // Find Variable based on name, select label definition type name and objectId
    //         Variable.findOne({'name': req.query.variable})
    //           .select('label definition type name comments _id')
    //           .exec(function(err, variable) {
    //             // Store results in JSON
    //             results.variable = variable;
    //             callback();
    //           });
    //       },
    //       function(callback) {
    //         // Find area based on code AND variable, select year value and exclude objectId
    //         Value.find({ 'area': results.area._id, 'variable': results.variable._id})
    //           .select('year value -_id')
    //           .exec(function(err, values) {
    //             if (err) console.error(err);
    //             for (var i = 0; i < values.length; i++) {
    //               // Add area to each value
    //               // Not working, unclear why
    //               // values[i]['area'] = 'true';
    //
    //               var json = {
    //                 'area': results.area.name,
    //                 'year': parseInt(values[i].year),
    //                 'value': parseFloat(values[i].value),
    //                 'code': results.area.code
    //               };
    //               values[i] = json
    //             }
    //             // Store results in JSON
    //             results.values = values;
    //             callback();
    //           })
    //       }
    //     ], function(err, response) {
    //       if (err) console.error(err);
    //       return res.json(results)
    //     });
    //   }
    //
    //   if (req.query.type === 'group') {
    //     var results = {
    //       group: req.query.variable,
    //       values: [],
    //       area: ''
    //     }
    //
    //     async.waterfall([
    //       function(callback) {
    //         // Find area based on code, select code name and objectId
    //         Area.findOne({'code': req.query.area})
    //           .select('code name _id')
    //           .exec(function(err, area) {
    //             // Store results in JSON
    //             results.area = area;
    //             callback();
    //         });
    //       },
    //       function(callback) {
    //         Group.findOne({'name': req.query.variable})
    //         .select('variables name label definition type')
    //         .exec(function(err, group) {
    //           results.group = group
    //
    //           async.each(group.variables, function(variable, callback) {
    //             Value.find({ 'area': results.area._id, 'variable': variable})
    //             .select('year variable value')
    //             .populate({ path: 'variable', select: 'label definition type -_id' })
    //             .exec(function(err, values) {
    //               if (values !== null) {
    //                 for (var i = 0; i < values.length; i++ ) {
    //                   // results.values.push(values[i]);
    //                   var json = {
    //                     'area': results.area.name,
    //                     'code': results.area.code,
    //                     'year': parseInt(values[i].year),
    //                     'value': parseFloat(values[i].value),
    //                     'variable': values[i].variable.label,
    //                     'type': values[i].variable.type
    //                   };
    //                   results.values.push(json);
    //                 }
    //               }
    //               callback();
    //             });
    //           }, function(err) {
    //             if (err) console.error(err);
    //             callback();
    //           });
    //         });
    //       }
    //     ], function(err, response) {
    //       if (err) console.error(err);
    //       console.log(results);
    //       return res.json(results)
    //     });
    //   }

    }

  }

})();
