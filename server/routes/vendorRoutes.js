const express = require('express');
const router = express.Router();
const {
    addVendor,
    getVendors,
    getVendorById
} = require('../controllers/vendorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, addVendor)
    .get(protect, admin, getVendors);

router.route('/:id')
    .get(protect, admin, getVendorById);

module.exports = router;
