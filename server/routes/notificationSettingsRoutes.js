const express = require('express');
const router = express.Router();
const { getNotificationSettings, updateNotificationSettings } = require('../controllers/notificationSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getNotificationSettings)
    .put(protect, admin, updateNotificationSettings);

module.exports = router;
