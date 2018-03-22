// app/models/variable.js

var mongoose 		    = require('mongoose');

// ============================= SCHEMA =============================
var VariableSchema  = new mongoose.Schema({

  name              : String,
  label             : String,
  definition        : String,
  location			: { type: Boolean, default: false},
  theme             : { type: mongoose.Schema.Types.ObjectId, ref: 'Theme' },
  group             : { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  type              : Number,
  comments          : [ { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' } ]
})



// ========================== EXPORT MODEL ==========================
module.exports = mongoose.model('Variable', VariableSchema);
