const mongoose = require('mongoose');

const REQUEST_STATUS = ['pending', 'approved', 'rejected'];
const URGENCY_LEVELS = ['low', 'medium', 'high', 'emergency'];

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    units: { type: Number, default: 1 },
    urgency: { type: String, enum: URGENCY_LEVELS, default: 'medium' },
    location: {
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },
    isEmergency: { type: Boolean, default: false },
    status: { type: String, enum: REQUEST_STATUS, default: 'pending' },
    adminRemarks: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
module.exports.REQUEST_STATUS = REQUEST_STATUS;
module.exports.URGENCY_LEVELS = URGENCY_LEVELS;

