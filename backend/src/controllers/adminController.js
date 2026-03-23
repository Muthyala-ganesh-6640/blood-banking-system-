const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');
const AuditLog = require('../models/AuditLog');
const DonationRequest = require('../models/DonationRequest');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      usersCount,
      hospitalsCount,
      requests,
      stocks,
      doctorAgg,
      hospitalPerf,
      emergencyCount,
      donationStats
    ] = await Promise.all([
      User.countDocuments({}),
      Hospital.countDocuments({}),
      BloodRequest.find({}),
      BloodStock.aggregate([
        {
          $group: {
            _id: '$bloodGroup',
            units: { $sum: '$units' }
          }
        }
      ]),
      Doctor.aggregate([
        {
          $group: {
            _id: '$hospital',
            count: { $sum: 1 }
          }
        }
      ]),
      BloodRequest.aggregate([
        {
          $group: {
            _id: '$hospital',
            count: { $sum: 1 }
          }
        }
      ]),
      BloodRequest.countDocuments({ isEmergency: true }),
      DonationRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    const totalRequests = requests.length;
    const pendingRequests = requests.filter((r) => r.status === 'pending').length;
    const approvedRequests = requests.filter((r) => r.status === 'approved').length;

    const stockByGroup = stocks.map((s) => ({
      bloodGroup: s._id,
      units: s.units
    }));

    const doctorCounts = doctorAgg;
    const hospitalPerformance = hospitalPerf;

    const totalDonations = donationStats.reduce((sum, s) => sum + s.count, 0);
    const pendingDonationRequests =
      donationStats.find((s) => s._id === 'pending')?.count || 0;
    const completedDonations =
      donationStats.find((s) => s._id === 'completed')?.count || 0;

    return res.json({
      totalUsers: usersCount,
      totalHospitals: hospitalsCount,
      totalRequests,
      pendingRequests,
      approvedRequests,
      emergencyRequests: emergencyCount,
      totalDonations,
      pendingDonationRequests,
      completedDonations,
      stockByGroup,
      doctorCounts,
      hospitalPerformance
    });
  } catch (err) {
    return next(err);
  }
};

exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const logs = await AuditLog.find({})
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('performedBy', 'name email role');

    const total = await AuditLog.countDocuments({});
    return res.json({ data: logs, total });
  } catch (err) {
    return next(err);
  }
};

