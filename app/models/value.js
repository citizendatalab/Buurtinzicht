// app/models/values.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var ValueSchema  = new mongoose.Schema({

  variable          : { type: mongoose.Schema.Types.ObjectId, ref: 'Variable' },
  value             : String,
  year              : String,
  area              : { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
})



// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Values', ValueSchema);
