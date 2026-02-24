const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema(
    {
        storeName: {
            type: String,
            required: true,
        },
        ownerName: {
            type: String,
        },
        email: {
            type: String,
        },
        phone: {
            type: String,
        },
        address: {
            type: String,
        },
        gstNumber: {
            type: String,
        },
        currency: {
            type: String,
            default: '₹',
        },
        logo: {
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
