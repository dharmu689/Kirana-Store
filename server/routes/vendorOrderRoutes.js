const express = require('express');
const router = express.Router();
const {
    placeOrder,
    getOrders,
    updateOrderStatus
} = require('../controllers/vendorOrderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, placeOrder)
    .get(protect, admin, getOrders);

router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);

module.exports = router;
