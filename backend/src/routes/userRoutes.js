const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth(), userController.getProfile);

router.put(
  '/me',
  auth(),
  [
    body('name').optional().notEmpty(),
    body('age').optional().isInt({ min: 0 }),
    body('bloodGroup')
      .optional()
      .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
  ],
  userController.updateProfile
);

router.post('/donor', auth(), userController.registerAsDonor);
router.get('/donations', auth(), userController.getDonationHistory);

module.exports = router;

