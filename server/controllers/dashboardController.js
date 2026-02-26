const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
    // 1. Today Revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todaySales = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfToday } } },
        {
            $group: {
                _id: null,
                todayRevenue: { $sum: '$totalPrice' }
            }
        }
    ]);
    const todayRevenue = todaySales[0]?.todayRevenue || 0;

    // 2. Monthly Revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlySales = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfMonth } } },
        {
            $group: {
                _id: null,
                monthlyRevenue: { $sum: '$totalPrice' }
            }
        }
    ]);
    const monthlyRevenue = monthlySales[0]?.monthlyRevenue || 0;

    // 3. Total Orders
    const totalOrders = await Sale.countDocuments();

    // 4. Low Stock Count
    const lowStockCount = await Product.countDocuments({
        $expr: { $lte: ['$quantity', '$reorderLevel'] },
        quantity: { $gt: 0 }
    });

    // 5. Sales Trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const trendData = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        trendData.push({
            date: d.toISOString().split('T')[0],
            sales: 0
        });
    }

    const salesData = await Sale.aggregate([
        { $match: { saleDate: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                dailySales: { $sum: "$totalPrice" }
            }
        }
    ]);

    salesData.forEach(sale => {
        const point = trendData.find(t => t.date === sale._id);
        if (point) point.sales = sale.dailySales;
    });

    res.json({
        todayRevenue,
        monthlyRevenue,
        totalOrders,
        lowStockCount,
        salesTrend: trendData
    });
});

module.exports = {
    getDashboardSummary
};
