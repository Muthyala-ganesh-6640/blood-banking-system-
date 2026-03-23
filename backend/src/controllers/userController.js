const { validationResult } = require('express-validator');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  return res.json(user);
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const allowedFields = ['name', 'phone', 'address', 'age', 'bloodGroup', 'healthStatus'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true
  }).select('-password');

  return res.json(user);
};

exports.registerAsDonor = async (req, res) => {
  const { bloodGroup, healthStatus } = req.body;
  if (!bloodGroup) {
    return res.status(400).json({ message: 'Blood group is required' });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { bloodGroup, healthStatus, isDonor: true },
    { new: true }
  ).select('-password');

  return res.json(user);
};

exports.getDonationHistory = async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('donationHistory.hospital', 'name address')
    .select('donationHistory');
  return res.json(user.donationHistory || []);
};

