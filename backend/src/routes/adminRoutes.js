const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const donationRequestController = require('../controllers/donationRequestController');
const auth = require('../middleware/auth');
const { sensitiveWriteLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.get('/dashboard', auth(['admin']), adminController.getDashboardStats);
router.get('/logs', auth(['admin']), adminController.getActivityLogs);

router.get('/donations', auth(['admin']), donationRequestController.getAllDonationRequests);

router.put(
  '/donations/:id/approve',
  auth(['admin']),
  sensitiveWriteLimiter,
  [body('assignedHospital').optional().isMongoId(), body('remarks').optional().isLength({ max: 500 })],
  (req, res, next) => {
    req.body.status = 'approved';
    return donationRequestController.updateDonationStatus(req, res, next);
  }
);

router.put(
  '/donations/:id/reject',
  auth(['admin']),
  sensitiveWriteLimiter,
  [body('remarks').optional().isLength({ max: 500 })],
  (req, res, next) => {
    req.body.status = 'rejected';
    return donationRequestController.updateDonationStatus(req, res, next);
  }
);

router.put(
  '/donations/:id/complete',
  auth(['admin']),
  sensitiveWriteLimiter,
  [body('remarks').optional().isLength({ max: 500 })],
  (req, res, next) => {
    req.body.status = 'completed';
    return donationRequestController.updateDonationStatus(req, res, next);
  }
);

module.exports = router;

