const mongoose = require('mongoose');

const saleSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        productName: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        quantitySold: {
            type: Number,
            required: [true, 'Please add quantity sold'],
            min: [1, 'Quantity must be at least 1']
        },
        unitPrice: {
            type: Number,
            required: [true, 'Please add unit price']
        },
        totalPrice: {
            type: Number,
            required: true
        },
        soldBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        paymentMethod: {
            type: String,
            required: [true, 'Please add payment method'],
            enum: ['Cash', 'UPI', 'Card']
        },
        saleDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Sale', saleSchema);
