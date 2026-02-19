const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a category name'],
            unique: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        // Future: Add productCount via virtual or manual update
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Category', categorySchema);
