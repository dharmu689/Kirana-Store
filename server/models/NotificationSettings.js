const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema(
    {
        enableEmailNotifications: {
            type: Boolean,
            default: true,
        },
        lowStockAlerts: {
            type: Boolean,
            default: true,
        },
        vendorOrderAlerts: {
            type: Boolean,
            default: true,
        },
        forecastAlerts: {
            type: Boolean,
            default: true,
        },
        notificationEmail: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one document exists
notificationSettingsSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.models.NotificationSettings.countDocuments();
        if (count > 0) {
            return next(new Error('Only one notification settings document can exist.'));
        }
    }
    next();
});

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
