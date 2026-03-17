const express = require('express');
const router = express.Router();
const {
  createCrimeStats,
  getCrimeStats,
  getCrimeStatsById,
  updateCrimeStats,
  deleteCrimeStats,
  getAnalyticsSummary,
} = require('../controllers/crimeStatsController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/analytics/summary', protect, getAnalyticsSummary);
router.route('/').get(protect, getCrimeStats).post(protect, createCrimeStats);
router
  .route('/:id')
  .get(protect, getCrimeStatsById)
  .put(protect, adminOnly, updateCrimeStats)
  .delete(protect, adminOnly, deleteCrimeStats);

module.exports = router;
