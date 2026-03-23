const { validationResult } = require('express-validator');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const AuditLog = require('../models/AuditLog');

function buildListQuery(query) {
  const { search, specialization } = query;
  const q = {};
  if (search) {
    q.name = { $regex: search, $options: 'i' };
  }
  if (specialization) {
    q.specialization = { $regex: specialization, $options: 'i' };
  }
  return q;
}

exports.createDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ statusCode: 400, errors: errors.array() });
    }

    let targetHospitalId;

    if (req.user.role === 'hospital') {
      if (!req.user.hospital) {
        return res
          .status(400)
          .json({ message: 'Hospital account is not linked to a hospital record' });
      }
      targetHospitalId = req.user.hospital;
    } else if (req.user.role === 'admin') {
      // Admin must explicitly provide hospital id
      if (!req.body.hospital) {
        return res.status(400).json({ message: 'Hospital id is required to create doctor' });
      }
      targetHospitalId = req.body.hospital;
    } else {
      return res.status(403).json({ message: 'Only hospital or admin accounts can create doctors' });
    }

    const hospital = await Hospital.findById(targetHospitalId);
    if (!hospital) {
      return res.status(400).json({ message: 'Target hospital not found' });
    }

    const payload = {
      ...req.body,
      hospital: targetHospitalId
    };

    if (req.file) {
      payload.profileImage = `/uploads/doctors/${req.file.filename}`;
    }

    const doctor = await Doctor.create(payload);
    hospital.doctors.push(doctor._id);
    await hospital.save();

    await AuditLog.create({
      actionType: 'doctor_created',
      performedBy: req.user._id,
      targetType: 'Doctor',
      targetId: doctor._id,
      metadata: { hospital: hospital._id }
    });

    return res.status(201).json(doctor);
  } catch (err) {
    return next(err);
  }
};

exports.getDoctors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = buildListQuery(req.query);

    const doctors = await Doctor.find(query)
      .populate('hospital', 'name address')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);
    return res.json({ data: doctors, total });
  } catch (err) {
    return next(err);
  }
};

exports.getDoctorsByHospital = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { hospitalId } = req.params;
    const query = buildListQuery(req.query);
    query.hospital = hospitalId;

    const doctors = await Doctor.find(query)
      .populate('hospital', 'name address')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);
    return res.json({ data: doctors, total });
  } catch (err) {
    return next(err);
  }
};

exports.getMyDoctors = async (req, res, next) => {
  try {
    if (req.user.role !== 'hospital' || !req.user.hospital) {
      return res.status(403).json({ message: 'Only hospital accounts can view their doctors' });
    }

    const { page = 1, limit = 10 } = req.query;
    const query = buildListQuery(req.query);
    query.hospital = req.user.hospital;

    const doctors = await Doctor.find(query)
      .populate('hospital', 'name address')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Doctor.countDocuments(query);
    return res.json({ data: doctors, total });
  } catch (err) {
    return next(err);
  }
};

exports.updateDoctor = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next({ statusCode: 400, errors: errors.array() });
    }

    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role === 'hospital') {
      if (!req.user.hospital || doctor.hospital.toString() !== String(req.user.hospital)) {
        return res.status(403).json({ message: 'Cannot modify doctor from another hospital' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    } else {
      // admin can view but not edit hospital-specific data
      return res.status(403).json({ message: 'Admins cannot edit hospital doctor records' });
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.profileImage = `/uploads/doctors/${req.file.filename}`;
    }

    const updated = await Doctor.findByIdAndUpdate(req.params.id, updates, {
      new: true
    });

    await AuditLog.create({
      actionType: 'doctor_updated',
      performedBy: req.user._id,
      targetType: 'Doctor',
      targetId: updated._id
    });

    return res.json(updated);
  } catch (err) {
    return next(err);
  }
};

exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role === 'hospital') {
      if (!req.user.hospital) {
        return res.status(403).json({ message: 'Only hospital accounts can delete doctors' });
      }
      if (doctor.hospital.toString() !== String(req.user.hospital)) {
        return res.status(403).json({ message: 'Cannot delete doctor from another hospital' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only hospital or admin accounts can delete doctors' });
    }

    await Doctor.deleteOne({ _id: doctor._id });
    await Hospital.updateOne({ _id: doctor.hospital }, { $pull: { doctors: doctor._id } });

    await AuditLog.create({
      actionType: 'doctor_deleted',
      performedBy: req.user._id,
      targetType: 'Doctor',
      targetId: doctor._id
    });

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('hospital', 'name address');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    return res.json(doctor);
  } catch (err) {
    return next(err);
  }
};

