const SystemPreferences = require('../models/SystemPreferences');

// @desc    Get system preferences
// @route   GET /api/settings/preferences
// @access  Private
const getSystemPreferences = async (req, res) => {
    try {
        let preferences = await SystemPreferences.findOne();

        // If not exist, return default values (creating a temporary instance just to get defaults)
        if (!preferences) {
            preferences = new SystemPreferences();
        }

        res.status(200).json(preferences);
    } catch (error) {
        console.error('Error fetching system preferences:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update system preferences
// @route   PUT /api/settings/preferences
// @access  Private/Admin
const updateSystemPreferences = async (req, res) => {
    try {
        const { darkMode, language, dateFormat, timeZone } = req.body;

        let preferences = await SystemPreferences.findOne();

        if (preferences) {
            preferences.darkMode = darkMode !== undefined ? darkMode : preferences.darkMode;
            preferences.language = language || preferences.language;
            preferences.dateFormat = dateFormat || preferences.dateFormat;
            preferences.timeZone = timeZone || preferences.timeZone;
            preferences.updatedAt = Date.now();

            const updatedPreferences = await preferences.save();
            res.status(200).json(updatedPreferences);
        } else {
            // Create new
            const newPreferences = new SystemPreferences({
                darkMode,
                language,
                dateFormat,
                timeZone
            });

            const createdPreferences = await newPreferences.save();
            res.status(201).json(createdPreferences);
        }
    } catch (error) {
        console.error('Error updating system preferences:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSystemPreferences,
    updateSystemPreferences
};
