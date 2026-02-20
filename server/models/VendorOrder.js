const mongoose = require('mongoose');

const vendorOrderSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Vendor'
        },
        quantity: {
            type: Number,
            required: [true, 'Please add quantity'],
            min: [1, 'Quantity must be at least 1']
        },
        orderDate: {
            type: Date,
            default: Date.now
        },
        deliveryAddress: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Delivered'],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('VendorOrder', vendorOrderSchema);
