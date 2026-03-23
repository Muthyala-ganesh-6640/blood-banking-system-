const mongoose = require('mongoose');

const DONATION_STATUS = ['pending', 'approved', 'rejected', 'completed'];

const donationRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    age: { type: Number, required: true, min: 18, max: 65 },
    weight: { type: Number, required: true, min: 45 },
    city: { type: String, required: true, trim: true },
    preferredHospital: { type: String, trim: true },
    availableDate: { type: Date, required: true },
    lastDonationDate: { type: Date },
    healthCondition: { type: String },
    message: { type: String, maxlength: 500 },
    status: { type: String, enum: DONATION_STATUS, default: 'pending' },
    assignedHospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
module.exports.DONATION_STATUS = DONATION_STATUS;

