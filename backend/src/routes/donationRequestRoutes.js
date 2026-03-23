const express = require('express');
const { body } = require('express-validator');
const donationRequestController = require('../controllers/donationRequestController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post(
  '/request',
  auth(),
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('phone').notEmpty(),
    body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('age').isInt({ min: 18, max: 65 }),
    body('weight').isFloat({ min: 45 }),
    body('city').notEmpty(),
    body('availableDate').isISO8601(),
    body('lastDonationDate').optional().isISO8601(),
    body('message').optional().isLength({ max: 500 })
  ],
  donationRequestController.createDonationRequest
);

router.get('/my-requests', auth(), donationRequestController.getMyDonationRequests);

module.exports = router;

