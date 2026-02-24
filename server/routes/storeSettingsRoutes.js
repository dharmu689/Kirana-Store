const express = require('express');
const router = express.Router();
const { getStoreSettings, updateStoreSettings } = require('../controllers/storeSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/store')
    .get(protect, getStoreSettings)
    .put(protect, admin, updateStoreSettings);

module.exports = router;
