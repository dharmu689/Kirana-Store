const express = require('express');
const router = express.Router();
const {
    getReorderItems,
    restockProduct
} = require('../controllers/reorderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, admin, getReorderItems);

router.route('/restock/:id')
    .put(protect, admin, restockProduct);

module.exports = router;
