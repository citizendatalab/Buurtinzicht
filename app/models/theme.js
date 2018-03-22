// app/models/theme.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var ThemeSchema 	    = new mongoose.Schema({

  name              : String,
  groups            : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Group' } ],
  variables         : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Variable' } ]

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Theme', ThemeSchema);
