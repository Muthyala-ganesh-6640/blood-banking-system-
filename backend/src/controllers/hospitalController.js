const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const BloodStock = require('../models/BloodStock');

exports.createHospital = async (req, res) => {
  const hospital = await Hospital.create(req.body);
  return res.status(201).json(hospital);
};

exports.getHospitals = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};
  if (search) {
    query.name = { $regex: search, $options: 'i' };
  }

  const hospitals = await Hospital.find(query)
    .populate('treatments')
    .populate('doctors')
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Hospital.countDocuments(query);
  return res.json({ data: hospitals, total });
};

exports.getHospitalById = async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)
    .populate('treatments')
    .populate('doctors');
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });
  return res.json(hospital);
};

exports.deleteHospital = async (req, res) => {
  const { id } = req.params;

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    return res.status(404).json({ message: 'Hospital not found' });
  }

  // Remove doctors and blood stock linked to this hospital
  await Promise.all([
    Doctor.deleteMany({ hospital: id }),
    BloodStock.deleteMany({ hospital: id }),
    Hospital.deleteOne({ _id: id })
  ]);

  return res.status(204).send();
};

