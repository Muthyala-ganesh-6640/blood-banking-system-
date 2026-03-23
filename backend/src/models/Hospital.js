const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    emergencyHelpline: { type: String },
    treatments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Treatment' }],
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    location: {
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

hospitalSchema.virtual('doctorCount', {
  ref: 'Doctor',
  localField: '_id',
  foreignField: 'hospital',
  count: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);

