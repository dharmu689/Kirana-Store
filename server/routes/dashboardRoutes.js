const express = require('express');
const router = express.Router();
const { getDashboardSummary, getDashboardProfit } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/profit', protect, getDashboardProfit);

module.exports = router;
