// app/models/values.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var MarkersSchema  = new mongoose.Schema({

  variable          : { type: mongoose.Schema.Types.ObjectId, ref: 'Variable' },
  lat             : Number,
  lng              : Number,
  area              : { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
})



// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Markers', MarkersSchema);
