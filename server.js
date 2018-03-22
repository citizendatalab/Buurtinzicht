// server.js

// ============================= SETUP ==============================



var bodyParser      = require('body-parser');
var express         = require('express');
var https 			= require('https');
var https 			= require('https');
var http 			= require('http');
var fs 				= require('fs');
var mongoose        = require('mongoose');
var morgan          = require('morgan');
var path            = require('path');

var app             = express();
var port            = process.env.PORT || 3100;
var database        = require('./app/config/database.js');

// ========================= CONFIGURATION ==========================

mongoose.connect(database.url);

var options = {
  key: fs.readFileSync('certs/certificate.key'),
  cert: fs.readFileSync('certs/certificate.crt')
};

app.use(function(req, res, next) {  
  if(!req.secure && process.env.NODE_ENV === 'production') {
    var secureUrl = "https://" + req.headers['host'] + req.url; 
    res.writeHead(301, { "Location":  secureUrl });
    res.end();
  }
  next();
});

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

// Create an HTTP service.
http.createServer(app).listen(3100);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(8443);
console.log('Running RESTful reporting on port: ' + port)
