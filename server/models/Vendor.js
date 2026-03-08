const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
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
            required: [true, 'Please add a phone number'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        address: {
            type: String,
            required: [true, 'Please add an address'],
            trim: true
        },
        productsSupplied: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        pricePerUnit: {
            type: Number,
            default: 0
        },
        averageDeliveryDays: {
            type: Number,
            default: 1
        },
        vendorRating: {
            type: Number,
            min: 1,
            max: 5,
            default: 3
        },
        reliabilityScore: {
            type: Number,
            default: 100 // Scale 0-100
        },
        totalOrdersCompleted: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Vendor', vendorSchema);
