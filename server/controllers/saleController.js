const mongoose = require('mongoose');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { createNotification } = require('../utils/notificationService');

// @desc    Create new sale(s) from a cart
// @route   POST /api/sales
// @access  Private (Admin/Staff)
const createSale = async (req, res) => {
    try {
        const { items, paymentMethod, customerName, customerMobile } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error('No items provided');
        }

        // Generate a unique receipt number based on timestamp and random digits
        const receiptNumber = `REC-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

        const createdSales = [];

        // We process in a loop; in production a transaction or bulkWrite is better, 
        // but to ensure individual product validations we iterate.
        for (const item of items) {
            const { product, quantitySold } = item;

            const productItem = await Product.findOne({ _id: product, userId: req.user.id });
            if (!productItem) {
                res.status(404);
                throw new Error(`Product not found`);
            }
            if (productItem.quantity < quantitySold) {
                res.status(400);
                throw new Error(`Insufficient stock for ${productItem.name}`);
            }

            let unitPrice = productItem.sellingPrice || productItem.price;
            const totalPrice = quantitySold * unitPrice;
            const totalProfit = (productItem.sellingPrice - productItem.purchasePrice) * quantitySold;

            // Create individual sale record sharing the same receipt number
            const sale = await Sale.create({
                receiptNumber,
                customerName: customerName || '',
                customerMobile: customerMobile || '',
                product,
                productName: productItem.name,
                category: productItem.category,
                quantitySold,
                unit: productItem.unit || 'piece',
                unitPrice,
                subtotal: totalPrice,
                totalPrice,
                profit: totalProfit,
                userId: req.user.id,
                soldBy: req.user.id,
                paymentMethod
            });

            // Deduct stock and update product sales stats
            await Product.updateOne(
                { _id: productItem._id },
                {
                    $inc: {
                        quantity: -quantitySold,
                        totalSold: quantitySold,
                        revenue: totalPrice
                    },
                    $set: {
                        lastSoldDate: Date.now()
                    }
                }
            );

            createdSales.push(sale);
        }

        // Trigger Notification for Sales Completion
        const totalSalePrice = createdSales.reduce((sum, s) => sum + s.totalPrice, 0);
        await createNotification(
            'POS Sale Completed',
            `A sale of ₹${totalSalePrice} completed for ${createdSales.length} item(s). Receipt: ${receiptNumber}`,
            'sale'
        );

        // Check if any product dropped below reorder level after the sale
        for (const item of items) {
             const prod = await Product.findById(item.product);
             if (prod && prod.quantity > 0 && prod.quantity <= prod.reorderLevel) {
                  await createNotification(
                      'Low Stock Alert',
                      `${prod.name} has dropped to ${prod.quantity} ${prod.unit}s (Reorder Level: ${prod.reorderLevel}).`,
                      'lowStock'
                  );
             } else if (prod && prod.quantity === 0) {
                  await createNotification(
                      'Out of Stock Alert',
                      `${prod.name} is now out of stock!`,
                      'lowStock'
                  );
             }
        }

        res.status(201).json({
            success: true,
            receiptNumber,
            sales: createdSales
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Admin/Staff)
const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find({ userId: req.user.id })
            .populate('soldBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get sales summary
// @route   GET /api/sales/summary
// @access  Private (Admin/Staff)
const getSalesSummary = async (req, res) => {
    try {
        const totalRevenue = await Sale.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        const totalSalesCount = await Sale.countDocuments({ userId: req.user.id });

        const monthlyBreakdown = await Sale.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        res.status(200).json({
            totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
            totalSalesCount,
            monthlyBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Sales Profit Summary
// @route   GET /api/sales/profit-summary
// @access  Private (Admin)
const getProfitSummary = async (req, res) => {
    try {
        const totalRevenue = await Sale.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalProfit = await Sale.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: null, total: { $sum: "$profit" } } }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayProfit = await Sale.aggregate([
            { $match: { createdAt: { $gte: today }, userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: null, total: { $sum: "$profit" } } }
        ]);

        res.json({
            totalRevenue: totalRevenue[0]?.total || 0,
            totalProfit: totalProfit[0]?.total || 0,
            todayProfit: todayProfit[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get sale by receipt number
// @route   GET /api/sales/receipt/:receiptNumber
// @access  Private (Admin/Staff)
const getSaleByReceipt = async (req, res) => {
    try {
        const { receiptNumber } = req.params;
        const sales = await Sale.find({ receiptNumber, userId: req.user.id })
            .populate('soldBy', 'name email')
            .populate('product', 'name price productId barcode')
            .sort({ createdAt: -1 });

        if (!sales || sales.length === 0) {
            res.status(404);
            throw new Error('Receipt not found');
        }

        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    createSale,
    getAllSales,
    getSalesSummary,
    getProfitSummary,
    getSaleByReceipt
};
