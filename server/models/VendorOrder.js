const mongoose = require('mongoose');

const vendorOrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
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
        productName: {
            type: String,
            required: true
        },
        vendorName: {
            type: String,
            required: true
        },
        vendorEmail: {
            type: String
        },
        vendorPhone: {
            type: String
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
            trim: true,
            required: [true, 'Please add delivery address']
        },
        invoiceFileUrl: {
            type: String
        },
        status: {
            type: String,
            enum: ['Pending', 'Delivered'],
            default: 'Pending'
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('VendorOrder', vendorOrderSchema);
