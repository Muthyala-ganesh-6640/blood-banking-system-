const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const USER_ROLES = ['user', 'admin', 'hospital'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    phone: { type: String },
    address: { type: String },
    age: { type: Number },
    hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    isDonor: { type: Boolean, default: false },
    healthStatus: { type: String },
    donationHistory: [
      {
        date: { type: Date, default: Date.now },
        hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
        units: { type: Number, default: 1 }
      }
    ]
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
module.exports.USER_ROLES = USER_ROLES;

