// app/models/area.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var CommentSchema   = new mongoose.Schema({

  option            : String,
  text              : String,
  variable          : { type: mongoose.Schema.Types.ObjectId, ref: 'Variable' },
  group             : { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  date              : Date

});

// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Comment', CommentSchema);
