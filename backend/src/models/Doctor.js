const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    qualification: { type: String },
    experience: { type: Number, min: 0 },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
    availableTimings: { type: String, required: true },
    contactEmail: { type: String },
    contactNumber: { type: String },
    profileImage: { type: String },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);

