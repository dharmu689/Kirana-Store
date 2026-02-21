const express = require('express');
const router = express.Router();
const {
    getSavedForecasts,
    generateForecast,
    regenerateForecast,
    getProductTrend,
    evaluateForecast,
    evaluateAllForecasts,
    getAutoReorder,
    toggleAutoReorder
} = require('../controllers/forecastController');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all saved forecasts
router.route('/').get(protect, admin, getSavedForecasts);

// Evaluate all forecasts
router.route('/evaluate-all').post(protect, admin, evaluateAllForecasts);

// Evaluate specific forecast
router.route('/:id/evaluate').put(protect, admin, evaluateForecast);

// --- Auto Reorder Smart System ---

// Get smart reorder tracking metrics
router.route('/auto-reorder').get(protect, admin, getAutoReorder);

// Toggle auto-reorder boolean per product
router.route('/auto-reorder/toggle/:productId').put(protect, admin, toggleAutoReorder);

// --- Standard Generation ---

// Generate new forecast without clearing history
router.route('/generate').post(protect, admin, generateForecast);

// Regenerate forecast, wiping history
router.route('/regenerate').put(protect, admin, regenerateForecast);

// Get specific product trend
router.route('/:productId/trend').get(protect, admin, getProductTrend);

module.exports = router;
