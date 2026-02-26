const express = require('express');
const router = express.Router();
const {
    createSale,
    getAllSales,
    getSalesSummary,
    getProfitSummary
} = require('../controllers/saleController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSale);
router.get('/', protect, getAllSales);
router.get('/summary', protect, getSalesSummary);
router.get('/profit-summary', protect, getProfitSummary);

module.exports = router;
