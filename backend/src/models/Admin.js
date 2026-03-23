const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    permissions: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);

