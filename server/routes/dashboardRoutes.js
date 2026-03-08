const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getDashboardProfit,
    getTopProducts,
    getLowSellingProducts,
    getProfitChartData
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/summary', protect, getDashboardSummary);
router.get('/profit', protect, getDashboardProfit);
router.get('/top-products', protect, getTopProducts);
router.get('/low-selling-products', protect, getLowSellingProducts);
router.get('/profit-chart', protect, getProfitChartData);

module.exports = router;
