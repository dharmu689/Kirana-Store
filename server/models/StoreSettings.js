const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
    {
        storeName: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
        },
        gstNumber: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure only one document exists
storeSettingsSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.models.StoreSettings.countDocuments();
        if (count > 0) {
            return next(new Error('Only one store settings document can exist.'));
        }
    }
    next();
});

const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

module.exports = StoreSettings;
