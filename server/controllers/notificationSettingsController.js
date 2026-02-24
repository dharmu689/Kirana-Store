const NotificationSettings = require('../models/NotificationSettings');

// @desc    Get notification settings
// @route   GET /api/settings/notifications
// @access  Private
const getNotificationSettings = async (req, res) => {
    try {
        const settings = await NotificationSettings.findOne();

        if (settings) {
            res.json(settings);
        } else {
            // Return default object if no settings exist yet
            res.json({
                enableEmailNotifications: true,
                lowStockAlerts: true,
                vendorOrderAlerts: true,
                forecastAlerts: true,
                notificationEmail: '',
            });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update or create notification settings
// @route   PUT /api/settings/notifications
// @access  Private/Admin
const updateNotificationSettings = async (req, res) => {
    try {
        const {
            enableEmailNotifications,
            lowStockAlerts,
            vendorOrderAlerts,
            forecastAlerts,
            notificationEmail,
        } = req.body;

        let settings = await NotificationSettings.findOne();

        if (settings) {
            // Update existing
            if (enableEmailNotifications !== undefined) settings.enableEmailNotifications = enableEmailNotifications;
            if (lowStockAlerts !== undefined) settings.lowStockAlerts = lowStockAlerts;
            if (vendorOrderAlerts !== undefined) settings.vendorOrderAlerts = vendorOrderAlerts;
            if (forecastAlerts !== undefined) settings.forecastAlerts = forecastAlerts;
            if (notificationEmail !== undefined) settings.notificationEmail = notificationEmail;

            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            // Create new
            settings = new NotificationSettings({
                enableEmailNotifications,
                lowStockAlerts,
                vendorOrderAlerts,
                forecastAlerts,
                notificationEmail,
            });

            const createdSettings = await settings.save();
            res.status(201).json(createdSettings);
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

module.exports = {
    getNotificationSettings,
    updateNotificationSettings,
};
