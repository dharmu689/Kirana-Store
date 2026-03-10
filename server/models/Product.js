const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        productId: {
            type: String,
            unique: true
        },
        name: {
            type: String,
            required: [true, 'Please add a product name'],
            trim: true
        },
        category: {
            type: String,
            required: [true, 'Please add a category'],
            trim: true
        },
        purchasePrice: {
            type: Number,
            required: true
        },
        sellingPrice: {
            type: Number,
            required: true
        },
        margin: {
            type: Number,
            default: 0
        },
        profitPerUnit: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'Please add a price'],
            min: [0, 'Price must be positive']
        },
        quantity: {
            type: Number,
            required: [true, 'Please add quantity'],
            min: [0, 'Quantity cannot be negative'],
            default: 0
        },
        reorderLevel: {
            type: Number,
            required: [true, 'Please add reorder level'],
            min: [0, 'Reorder level cannot be negative'],
            default: 10
        },
        expiryDate: {
            type: Date
        },
        supplierLeadTime: {
            type: Number,
            required: false,
            default: 1 // in days
        },
        unit: {
            type: String
        },
        avgDailyDemand: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        totalSold: {
            type: Number,
            default: 0
        },
        revenue: {
            type: Number,
            default: 0
        },
        latestPredictedDemand: {
            type: Number,
            default: 0
        },
        aiSuggestedReorder: {
            type: Number,
            default: 0
        },
        lastSoldDate: {
            type: Date
        },
        qrCode: {
            type: String
        },
        barcode: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Product', productSchema);
