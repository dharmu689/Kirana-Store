const express = require('express');
const router = express.Router();
const { getSalesReport, getInventoryReport, getFinancialReport, getVendorReport, getForecastReport } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/sales').get(protect, admin, getSalesReport);
router.route('/inventory').get(protect, admin, getInventoryReport);
router.route('/financial').get(protect, admin, getFinancialReport);
router.route('/vendors').get(protect, admin, getVendorReport);
router.route('/forecast').get(protect, admin, getForecastReport);

module.exports = router;
