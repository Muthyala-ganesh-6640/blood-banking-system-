const express = require('express');
const { body } = require('express-validator');
const bloodRequestController = require('../controllers/bloodRequestController');
const auth = require('../middleware/auth');
const { sensitiveWriteLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post(
  '/',
  auth(),
  [
    body('hospital').notEmpty(),
    body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('urgency').optional().isIn(['low', 'medium', 'high', 'emergency'])
  ],
  bloodRequestController.createRequest
);

router.get('/me', auth(), bloodRequestController.getMyRequests);
router.get('/', auth(['admin']), bloodRequestController.getAllRequests);
router.patch(
  '/:id/status',
  auth(['admin']),
  sensitiveWriteLimiter,
  [
    body('status').isIn(['pending', 'approved', 'rejected']),
    body('adminRemarks').optional().isString().isLength({ max: 500 })
  ],
  bloodRequestController.updateStatus
);

module.exports = router;

