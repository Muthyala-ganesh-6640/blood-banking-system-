const express = require('express');
const bloodController = require('../controllers/bloodController');
const auth = require('../middleware/auth');

const router = express.Router();

router.put('/stock/:hospitalId', auth(['admin', 'hospital']), bloodController.updateBloodStock);
router.get('/stock/:hospitalId', bloodController.getBloodStockByHospital);
router.get('/search', bloodController.searchBlood);

module.exports = router;

