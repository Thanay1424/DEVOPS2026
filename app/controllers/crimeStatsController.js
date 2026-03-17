const CrimeStats = require('../models/CrimeStats');

// POST /api/crime-stats
const createCrimeStats = async (req, res, next) => {
  try {
    const { theft, assault, fraud, cybercrime, crimeIndex, region, notes } =
      req.body;

    if (
      theft === undefined ||
      assault === undefined ||
      fraud === undefined ||
      cybercrime === undefined ||
      crimeIndex === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Please provide theft, assault, fraud, cybercrime, and crimeIndex values.',
      });
    }

    const stats = await CrimeStats.create({
      theft,
      assault,
      fraud,
      cybercrime,
      crimeIndex,
      region: region || 'National',
      notes: notes || '',
      reportedBy: req.user._id,
    });

    const populated = await stats.populate('reportedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Crime statistics recorded successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/crime-stats
const getCrimeStats = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const total = await CrimeStats.countDocuments();
    const stats = await CrimeStats.find()
      .populate('reportedBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // Get the latest record for dashboard
    const latest = stats[0] || null;

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      latest,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/crime-stats/:id
const getCrimeStatsById = async (req, res, next) => {
  try {
    const stats = await CrimeStats.findById(req.params.id).populate(
      'reportedBy',
      'username email'
    );
    if (!stats) {
      return res
        .status(404)
        .json({ success: false, message: 'Crime stats not found.' });
    }
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

// PUT /api/crime-stats/:id (admin only)
const updateCrimeStats = async (req, res, next) => {
  try {
    const stats = await CrimeStats.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('reportedBy', 'username email');

    if (!stats) {
      return res
        .status(404)
        .json({ success: false, message: 'Crime stats not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Crime statistics updated successfully.',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/crime-stats/:id (admin only)
const deleteCrimeStats = async (req, res, next) => {
  try {
    const stats = await CrimeStats.findByIdAndDelete(req.params.id);
    if (!stats) {
      return res
        .status(404)
        .json({ success: false, message: 'Crime stats not found.' });
    }
    res
      .status(200)
      .json({ success: true, message: 'Crime statistics deleted.' });
  } catch (error) {
    next(error);
  }
};

// GET /api/crime-stats/analytics/summary
const getAnalyticsSummary = async (req, res, next) => {
  try {
    const allStats = await CrimeStats.find().sort({ createdAt: 1 });

    if (!allStats.length) {
      return res.status(200).json({
        success: true,
        message: 'No data available yet.',
        summary: null,
        trends: [],
      });
    }

    const totals = allStats.reduce(
      (acc, s) => {
        acc.theft += s.theft;
        acc.assault += s.assault;
        acc.fraud += s.fraud;
        acc.cybercrime += s.cybercrime;
        acc.crimeIndex += s.crimeIndex;
        return acc;
      },
      { theft: 0, assault: 0, fraud: 0, cybercrime: 0, crimeIndex: 0 }
    );

    const count = allStats.length;
    const averages = {
      theft: (totals.theft / count).toFixed(1),
      assault: (totals.assault / count).toFixed(1),
      fraud: (totals.fraud / count).toFixed(1),
      cybercrime: (totals.cybercrime / count).toFixed(1),
      crimeIndex: (totals.crimeIndex / count).toFixed(1),
    };

    const trends = allStats.slice(-12).map((s) => ({
      date: s.createdAt,
      theft: s.theft,
      assault: s.assault,
      fraud: s.fraud,
      cybercrime: s.cybercrime,
      crimeIndex: s.crimeIndex,
    }));

    res.status(200).json({
      success: true,
      totalRecords: count,
      totals,
      averages,
      latest: allStats[allStats.length - 1],
      trends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCrimeStats,
  getCrimeStats,
  getCrimeStatsById,
  updateCrimeStats,
  deleteCrimeStats,
  getAnalyticsSummary,
};
