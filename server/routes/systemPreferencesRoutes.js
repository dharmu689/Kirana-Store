const express = require('express');
const router = express.Router();
const { getSystemPreferences, updateSystemPreferences } = require('../controllers/systemPreferencesController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/preferences')
    .get(protect, getSystemPreferences)
    .put(protect, admin, updateSystemPreferences);

module.exports = router;
