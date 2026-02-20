const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const VendorOrder = require('../models/VendorOrder');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
    // 1. Product Statistics
    const totalProducts = await Product.countDocuments();

    // Calculate total stock and inventory value
    const productStats = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalStock: { $sum: '$quantity' },
                inventoryValue: { $sum: { $multiply: ['$price', '$quantity'] } }
            }
        }
    ]);

    const totalStockQuantity = productStats[0]?.totalStock || 0;
    const inventoryValue = productStats[0]?.inventoryValue || 0;

    // Low Stock & Out of Stock
    // Using $expr for low stock to compare quantity with reorderLevel
    const lowStockCount = await Product.countDocuments({
        $expr: { $lte: ['$quantity', '$reorderLevel'] },
        quantity: { $gt: 0 } // Exclude out of stock
    });

    const outOfStockCount = await Product.countDocuments({ quantity: 0 });

    // 2. Sales Statistics
    const salesStats = await Sale.aggregate([
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                totalSalesCount: { $sum: 1 }
            }
        }
    ]);

    const totalRevenue = salesStats[0]?.totalRevenue || 0;
    const totalSalesCount = salesStats[0]?.totalSalesCount || 0;

    // 3. Monthly Revenue (for chart)
    const monthlyRevenue = await Sale.aggregate([
        {
            $group: {
                _id: { $month: '$createdAt' },
                revenue: { $sum: '$totalPrice' }
            }
        },
        { $sort: { '_id': 1 } }
    ]);

    // 4. Low Stock Items (Top 5 for display)
    const lowStockItems = await Product.find({
        $expr: { $lte: ['$quantity', '$reorderLevel'] }
    })
        .sort({ quantity: 1 })
        .limit(5)
        .select('name quantity reorderLevel category');

    // 5. Recent Sales (Top 5)
    const recentSales = await Sale.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('product', 'name') // Populate product name if needed, though Sale model stores it too
        .select('productName totalprice quantitySold createdAt paymentMethod');


    // 6. Reorder Alerts Logic (Reusing simple logic for summary speed, or we can import the detailed logic.
    // For Dashboard summary, we'll keep it simple: quantity <= reorderLevel OR calculated one.
    // For speed, let's just use the manual reorderLevel for now in the summary count, 
    // as calculating 30-day avg for ALL products on every dashboard refresh might be slow.
    // Alternatively, we can use the count from the explicit query below.

    // Using explicitly stored reorderLevel for fast dashboard count
    const reorderAlertCount = await Product.countDocuments({
        $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    const criticalStockCount = await Product.countDocuments({ quantity: 0 });

    // 7. Vendor Orders Statistics
    const pendingVendorOrdersCount = await VendorOrder.countDocuments({ status: 'Pending' });
    const deliveredOrdersCount = await VendorOrder.countDocuments({ status: 'Delivered' });

    // 8. Recent Vendor Orders (Top 5)
    const recentVendorOrders = await VendorOrder.find()
        .sort({ orderDate: -1 })
        .limit(5)
        .populate('product', 'name')
        .populate('vendor', 'name');

    res.json({
        totalProducts,
        totalStockQuantity,
        inventoryValue,
        lowStockCount, // This is essentially reorderAlertCount based on our definition
        outOfStockCount,
        totalRevenue,
        totalSalesCount,
        monthlyRevenue,
        lowStockItems,
        recentSales,
        reorderAlertCount,
        criticalStockCount,
        pendingVendorOrdersCount,
        deliveredOrdersCount,
        recentVendorOrders
    });
});

module.exports = {
    getDashboardSummary
};
