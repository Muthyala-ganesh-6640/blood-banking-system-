const { validationResult } = require('express-validator');
const DonationRequest = require('../models/DonationRequest');
const AuditLog = require('../models/AuditLog');

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

exports.createDonationRequest = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const now = Date.now();
    const cutoff = new Date(now - NINETY_DAYS_MS);

    const existingRecent = await DonationRequest.findOne({
      user: req.user._id,
      createdAt: { $gte: cutoff },
      status: { $in: ['pending', 'approved', 'completed'] }
    });

    if (existingRecent) {
      return res.status(400).json({
        message: 'You already have a recent donation request. You can donate again after 90 days.'
      });
    }

    const payload = {
      user: req.user._id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      bloodGroup: req.body.bloodGroup,
      age: req.body.age,
      weight: req.body.weight,
      city: req.body.city,
      preferredHospital: req.body.preferredHospital,
      availableDate: req.body.availableDate,
      lastDonationDate: req.body.lastDonationDate,
      healthCondition: req.body.healthCondition,
      message: req.body.message
    };

    const donation = await DonationRequest.create(payload);

    await AuditLog.create({
      actionType: 'donation_request_created',
      performedBy: req.user._id,
      targetType: 'DonationRequest',
      targetId: donation._id,
      metadata: {
        bloodGroup: donation.bloodGroup,
        city: donation.city,
        status: donation.status
      }
    });

    return res.status(201).json(donation);
  } catch (err) {
    return next(err);
  }
};

exports.getMyDonationRequests = async (req, res, next) => {
  try {
    const donations = await DonationRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedHospital', 'name');
    return res.json(donations);
  } catch (err) {
    return next(err);
  }
};

exports.getAllDonationRequests = async (req, res, next) => {
  try {
    const { status, bloodGroup, city } = req.query;
    const query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = new RegExp(city, 'i');

    const donations = await DonationRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email bloodGroup')
      .populate('assignedHospital', 'name');

    return res.json(donations);
  } catch (err) {
    return next(err);
  }
};

exports.updateDonationStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ statusCode: 400, errors: errors.array() });
    }

    const { status, assignedHospital, remarks } = req.body;
    const donationId = req.params.id;

    const donation = await DonationRequest.findById(donationId).populate('user', 'name email');

    if (!donation) {
      return next({ statusCode: 404, message: 'Donation request not found' });
    }

    if (donation.status === 'rejected' || donation.status === 'completed') {
      return next({ statusCode: 400, message: 'This donation request can no longer be updated' });
    }

    if (donation.status === 'pending' && status === 'completed') {
      return next({
        statusCode: 400,
        message: 'Pending requests must be approved before they can be completed'
      });
    }

    if (assignedHospital) {
      donation.assignedHospital = assignedHospital;
    }

    donation.status = status;

    await donation.save();

    await AuditLog.create({
      actionType: `donation_request_${status}`,
      performedBy: req.user._id,
      targetType: 'DonationRequest',
      targetId: donation._id,
      metadata: {
        status,
        remarks,
        bloodGroup: donation.bloodGroup,
        city: donation.city
      }
    });

    return res.json(donation);
  } catch (err) {
    return next(err);
  }
};

