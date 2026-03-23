const BloodStock = require('../models/BloodStock');
const Hospital = require('../models/Hospital');

exports.updateBloodStock = async (req, res) => {
  const { hospitalId } = req.params;
  const { bloodGroup, units } = req.body;

  const hospital = await Hospital.findById(hospitalId);
  if (!hospital) return res.status(404).json({ message: 'Hospital not found' });

  const stock = await BloodStock.findOneAndUpdate(
    { hospital: hospitalId, bloodGroup },
    { units, lastUpdated: new Date() },
    { new: true, upsert: true }
  );

  return res.json(stock);
};

exports.getBloodStockByHospital = async (req, res) => {
  const { hospitalId } = req.params;
  const stock = await BloodStock.find({ hospital: hospitalId });
  return res.json(stock);
};

exports.searchBlood = async (req, res) => {
  const { bloodGroup, city, state } = req.query;
  const hospitalQuery = {};
  if (city) hospitalQuery['location.city'] = { $regex: city, $options: 'i' };
  if (state) hospitalQuery['location.state'] = { $regex: state, $options: 'i' };

  const hospitals = await Hospital.find(hospitalQuery).select('_id name location');
  const hospitalIds = hospitals.map((h) => h._id);

  const stockQuery = { hospital: { $in: hospitalIds } };
  if (bloodGroup) stockQuery.bloodGroup = bloodGroup;

  const stock = await BloodStock.find(stockQuery).populate('hospital', 'name location');
  return res.json(stock);
};

