// server/utils/notificationService.js
const Notification = require('../models/Notification');

/**
 * Creates a new notification in the database.
 * @param {string} title - The title of the notification
 * @param {string} message - The detailed message
 * @param {string} type - The category of the notification (e.g., 'system', 'sale', 'product', 'vendor')
 */
const createNotification = async (title, message, type = 'system') => {
    try {
        await Notification.create({
            title,
            message,
            type,
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

module.exports = {
    createNotification
};
