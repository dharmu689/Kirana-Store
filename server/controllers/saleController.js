const Sale = require('../models/Sale');
const Product = require('../models/Product');

// @desc    Create new sale
// @route   POST /api/sales
// @access  Private (Admin/Staff)
const createSale = async (req, res) => {
    try {
        const { product, quantitySold, paymentMethod } = req.body;

        const productItem = await Product.findById(product);

        if (!productItem) {
            res.status(404);
            throw new Error('Product not found');
        }

        if (productItem.quantity < quantitySold) {
            res.status(400);
            throw new Error('Insufficient stock');
        }

        // Calculate total price
        const totalPrice = quantitySold * productItem.price;

        // Create sale
        const sale = await Sale.create({
            product,
            productName: productItem.name,
            category: productItem.category,
            quantitySold,
            unitPrice: productItem.price,
            totalPrice,
            soldBy: req.user.id,
            paymentMethod
        });

        // Deduct stock
        productItem.quantity -= quantitySold;

        // Update product sales stats
        productItem.totalSold = (productItem.totalSold || 0) + quantitySold;
        productItem.revenue = (productItem.revenue || 0) + totalPrice;
        productItem.lastSoldDate = Date.now();

        await productItem.save();

        res.status(201).json(sale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private (Admin/Staff)
const getAllSales = async (req, res) => {
    try {
        const sales = await Sale.find()
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
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalPrice' }
                }
            }
        ]);

        const totalSalesCount = await Sale.countDocuments();

        const monthlyBreakdown = await Sale.aggregate([
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

module.exports = {
    createSale,
    getAllSales,
    getSalesSummary
};
