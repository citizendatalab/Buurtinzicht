// server.js

// ============================= SETUP ==============================

var bodyParser      = require('body-parser');
var express         = require('express');
var mongoose        = require('mongoose');
var morgan          = require('morgan');
var path            = require('path');

var app             = express();
var port            = process.env.PORT || 3100;
var database        = require('./app/config/database.js');

// ========================= CONFIGURATION ==========================

mongoose.connect(database.url);

app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'origin, x-requested-with, x-http-method-override, content-type, Authorization');
  next();
});

// ============================= ROUTES =============================
require('./app/routes.js')(app);

process.on('uncaughtException', function(err) {
  console.log(err);
});

// ============================== RUN ===============================

app.listen(port);
console.log('Running RESTful reporting on port: ' + port)
