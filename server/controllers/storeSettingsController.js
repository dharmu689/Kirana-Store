const StoreSettings = require('../models/StoreSettings');

// @desc    Get store settings
// @route   GET /api/settings/store
// @access  Public/Private (depending on requirements, let's make it accessible to logged-in users or public for frontend display)
const getStoreSettings = async (req, res) => {
    try {
        const settings = await StoreSettings.findOne();

        if (settings) {
            res.json(settings);
        } else {
            // Return empty object if no settings exist yet
            res.json({});
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update or create store settings
// @route   PUT /api/settings/store
// @access  Private/Admin
const updateStoreSettings = async (req, res) => {
    try {
        const {
            storeName,
            phone,
            email,
            gstNumber,
        } = req.body;

        let settings = await StoreSettings.findOne();

        if (settings) {
            // Update existing
            settings.storeName = storeName || settings.storeName;
            settings.phone = phone !== undefined ? phone : settings.phone;
            settings.email = email !== undefined ? email : settings.email;
            settings.gstNumber = gstNumber !== undefined ? gstNumber : settings.gstNumber;

            const updatedSettings = await settings.save();
            res.json(updatedSettings);
        } else {
            // Create new
            settings = new StoreSettings({
                storeName,
                phone,
                email,
                gstNumber,
            });

            const createdSettings = await settings.save();
            res.status(201).json(createdSettings);
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

module.exports = {
    getStoreSettings,
    updateStoreSettings,
};
