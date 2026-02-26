const mongoose = require('mongoose');

const systemPreferencesSchema = new mongoose.Schema({
    darkMode: {
        type: Boolean,
        default: false
    },
    language: {
        type: String,
        default: 'English'
    },
    dateFormat: {
        type: String,
        default: 'DD-MM-YYYY'
    },
    timeZone: {
        type: String,
        default: 'Asia/Kolkata'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const SystemPreferences = mongoose.model('SystemPreferences', systemPreferencesSchema);

module.exports = SystemPreferences;
