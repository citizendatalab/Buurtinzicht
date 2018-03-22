// app/models/area.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var AreaSchema 	    = new mongoose.Schema({

  name              : String,
  code              : String,
  codename          : String,
  sdcode            : String,
  sdname            : String,
  levelname         : String,
  geojson           : Object,
  parent            : { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
  children          : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Area' } ]

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Area', AreaSchema);
