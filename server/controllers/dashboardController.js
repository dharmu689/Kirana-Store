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

// @desc    Get dashboard profit analytics
// @route   GET /api/dashboard/profit
// @access  Private
const getDashboardProfit = asyncHandler(async (req, res) => {
    try {
        const totalProfit = await Sale.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$profit" }
                }
            }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneDayProfit = await Sale.aggregate([
            {
                $match: { createdAt: { $gte: today } }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$profit" }
                }
            }
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const thirtyDaysProfit = await Sale.aggregate([
            {
                $match: { createdAt: { $gte: thirtyDaysAgo } }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$profit" }
                }
            }
        ]);

        res.json({
            totalProfit: totalProfit[0]?.total || 0,
            oneDayProfit: oneDayProfit[0]?.total || 0,
            thirtyDaysProfit: thirtyDaysProfit[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: "Profit fetch failed" });
    }
});

module.exports = {
    getDashboardSummary,
    getDashboardProfit
};
