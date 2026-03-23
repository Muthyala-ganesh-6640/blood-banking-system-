const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    category: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Treatment', treatmentSchema);

