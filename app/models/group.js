// app/models/group.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var GroupSchema 	    = new mongoose.Schema({

  name              : String,
  label             : String,
  definition        : String,
  type              : Number,
  theme             : { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
  variables         : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Variable' } ],
  comments          : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ]

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Group', GroupSchema);
