const express = require('express');
const hospitalController = require('../controllers/hospitalController');
const auth = require('../middleware/auth');
const DonationRequest = require('../models/DonationRequest');

const router = express.Router();

// Admin: create hospital
router.post('/', auth(['admin']), hospitalController.createHospital);

// Public: list and view hospitals
router.get('/', hospitalController.getHospitals);
router.get('/:id', hospitalController.getHospitalById);

// Admin: delete hospital
router.delete('/:id', auth(['admin']), hospitalController.deleteHospital);

// Hospital role: view approved donation requests assigned to this hospital
router.get('/me/donations', auth(['hospital']), async (req, res, next) => {
  try {
    const donations = await DonationRequest.find({
      assignedHospital: req.user.hospital,
      status: 'approved'
    })
      .sort({ availableDate: 1 })
      .populate('user', 'name email phone bloodGroup');

    return res.json(donations);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;

