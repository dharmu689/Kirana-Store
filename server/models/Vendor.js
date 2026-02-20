const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a vendor name'],
            trim: true
        },
        contactPerson: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        address: {
            type: String,
            trim: true
        },
        productsSupplied: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Vendor', vendorSchema);
