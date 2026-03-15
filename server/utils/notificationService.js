// server/utils/notificationService.js
const Notification = require('../models/Notification');

/**
 * Creates a new notification in the database.
 * @param {string} title - The title of the notification
 * @param {string} message - The detailed message
 * @param {string} type - The category of the notification (e.g., 'system', 'sale', 'product', 'vendor')
 * @param {string} userId - The ID of the logged-in user
 */
const createNotification = async (title, message, type = 'system', userId) => {
    try {
        await Notification.create({
            title,
            message,
            type,
            userId
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
    }
};

module.exports = {
    createNotification
};
