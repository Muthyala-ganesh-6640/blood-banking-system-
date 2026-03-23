const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');
const { sendEmail } = require('../utils/email');
const User = require('../models/User');
const Admin = require('../models/Admin');
const AuditLog = require('../models/AuditLog');

exports.createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const request = await BloodRequest.create({
    requester: req.user._id,
    ...req.body
  });

  return res.status(201).json(request);
};

exports.getMyRequests = async (req, res) => {
  const requests = await BloodRequest.find({ requester: req.user._id }).populate(
    'hospital',
    'name address'
  );
  return res.json(requests);
};

exports.getAllRequests = async (req, res) => {
  const { status } = req.query;
  const query = {};
  if (status) query.status = status;
  const requests = await BloodRequest.find(query)
    .populate('requester', 'name email bloodGroup')
    .populate('hospital', 'name');
  return res.json(requests);
};

exports.updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ statusCode: 400, errors: errors.array() });
    }

    const { status, adminRemarks } = req.body;
    const requestId = req.params.id;

    // Fetch the request
    const request = await BloodRequest.findById(requestId)
      .populate('requester', 'name email')
      .populate('hospital', 'name');

    if (!request) {
      return next({ statusCode: 404, message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return next({ statusCode: 400, message: 'Only pending requests can be updated' });
    }

    // If approving, deduct stock
    if (status === 'approved') {
      const stock = await BloodStock.findOne({
        hospital: request.hospital._id,
        bloodGroup: request.bloodGroup
      });

      if (!stock || stock.units < request.units) {
        return next({
          statusCode: 400,
          message: 'Insufficient blood stock to approve this request'
        });
      }

      stock.units -= request.units;
      stock.lastUpdated = new Date();
      await stock.save();
    }

    request.status = status;
    if (adminRemarks) {
      request.adminRemarks = adminRemarks;
    }
    if (status === 'approved') {
      const admin = await Admin.findOne({ user: req.user._id });
      request.approvedBy = admin ? admin._id : undefined;
      request.approvedAt = new Date();
    }
    await request.save();

    await AuditLog.create({
      actionType: `blood_request_${status}`,
      performedBy: req.user._id,
      targetType: 'BloodRequest',
      targetId: request._id,
      metadata: {
        status,
        adminRemarks,
        isEmergency: request.isEmergency,
        units: request.units,
        bloodGroup: request.bloodGroup
      }
    });

    // Notify user via email when approved
    if (status === 'approved' && request.requester.email) {
      await sendEmail({
        to: request.requester.email,
        subject: 'Your blood request has been approved',
        html: `<p>Dear ${request.requester.name},</p>
               <p>Your blood request for ${request.bloodGroup} at ${request.hospital.name} has been approved.</p>`
      });
    }

    return res.json(request);
  } catch (err) {
    return next(err);
  }
};


