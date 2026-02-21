const express = require('express');
const router = express.Router();
const {
    addVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
} = require('../controllers/vendorController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, admin, addVendor)
    .get(protect, admin, getVendors);

router.route('/:id')
    .get(protect, admin, getVendorById)
    .put(protect, admin, updateVendor)
    .delete(protect, admin, deleteVendor);

module.exports = router;
