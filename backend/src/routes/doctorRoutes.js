const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const doctorController = require('../controllers/doctorController');
const auth = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'doctors');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

const doctorValidation = [
  body('name').notEmpty(),
  body('specialization').notEmpty(),
  body('qualification').optional().isString(),
  body('experience').optional().isInt({ min: 0 }),
  body('availableTimings').notEmpty(),
  body('contactEmail').optional().isEmail(),
  body('status').optional().isIn(['active', 'inactive'])
];

// Create doctor (admin can create for any hospital, hospital user for their own)
router.post(
  '/',
  auth(['admin', 'hospital']),
  upload.single('profileImage'),
  doctorValidation,
  doctorController.createDoctor
);

// List all doctors (with optional search/specialization)
router.get('/', doctorController.getDoctors);

// List doctors for a specific hospital (admin view)
router.get('/hospital/:hospitalId', doctorController.getDoctorsByHospital);
router.get('/my', auth(['hospital']), doctorController.getMyDoctors);

router.put(
  '/:id',
  auth(['hospital', 'admin']),
  upload.single('profileImage'),
  doctorValidation,
  doctorController.updateDoctor
);

router.delete('/:id', auth(['admin', 'hospital']), doctorController.deleteDoctor);

router.get('/:id', auth(['admin']), doctorController.getDoctorById);

module.exports = router;

