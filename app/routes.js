var path                  = require('path');

var ImportController      = require('./controllers/ImportController'),
    ListController        = require('./controllers/ListController'),
    WidgetController      = require('./controllers/WidgetController');

module.exports 	          = function(routes) {

  routes.get('/api/import/geolocation', ImportController.geolocation);
  // routes.get('/api/import/metadata', ImportController.metadata);
  // routes.get('/api/import/areas', ImportController.areas);
  // routes.get('/api/import/geojson', ImportController.geojson);
  // routes.get('/api/import/values', ImportController.values);

  // ========================== LIST ITEMS ==========================

  routes.get('/api/list/definitions', ListController.themes);

  routes.get('/api/list/themes', ListController.themes);
  routes.get('/api/list/themes/id/:id', ListController.themeById);
  routes.get('/api/list/themes/name/:name', ListController.themeByName);

  routes.get('/api/list/groups', ListController.groups);
  routes.get('/api/list/groups/id/:id', ListController.groupById);

  routes.get('/api/list/areas', ListController.areas);
  routes.get('/api/list/areas/id/:id', ListController.areaById);
  routes.get('/api/list/areas/code/:areas', ListController.areasByCode);
  routes.get('/api/list/areas/level/:level', ListController.areaByLevel);

  routes.get('/api/list/variables', ListController.variables);
  routes.get('/api/list/variables/id/:id', ListController.variableById);
  routes.get('/api/list/variables/name/:name', ListController.variableByName);
  routes.get('/api/list/variables/theme/:theme', ListController.variableByTheme);

  routes.get('/api/list/values', ListController.values);
  routes.get('/api/list/values/cards/', ListController.valuesByCards);
  routes.get('/api/list/values/detail/', ListController.valuesByDetail);
  routes.get('/api/list/values/single/', ListController.valuesBySingle);
  routes.get('/api/list/values/code/:code/:theme', ListController.valueByCode);

  // ============================ WIDGET ============================

  routes.get('/api/widget/variable', WidgetController.variable);
  routes.get('/api/widget/group', WidgetController.group);

  routes.post('/api/widget/submitFeedback', WidgetController.sumbitFeedback);


  routes.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });

};
