const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = asyncHandler(async (req, res) => {
    // Shared Date Boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Fire all MongoDB Aggregations Concurrently
    const [
        todaySales,
        monthlySales,
        totalOrders,
        lowStockCount,
        totalProducts,
        salesData
    ] = await Promise.all([
        // 1. Today Revenue
        Sale.aggregate([
            { $match: { saleDate: { $gte: startOfToday }, userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: null, todayRevenue: { $sum: '$totalPrice' } } }
        ]),
        // 2. Monthly Revenue
        Sale.aggregate([
            { $match: { saleDate: { $gte: startOfMonth }, userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $group: { _id: null, monthlyRevenue: { $sum: '$totalPrice' } } }
        ]),
        // 3. Total Orders
        Sale.countDocuments({ userId: req.user.id }),
        // 4. Low Stock Count
        Product.countDocuments({
            $expr: { $lte: ['$quantity', '$reorderLevel'] },
            quantity: { $gt: 0 },
            userId: req.user.id
        }),
        // 5. Total Products Count
        Product.countDocuments({ userId: req.user.id }),
        // 6. Sales Trend Data
        Sale.aggregate([
            { $match: { saleDate: { $gte: thirtyDaysAgo }, userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                    dailySales: { $sum: "$totalPrice" }
                }
            }
        ])
    ]);

    // Format Concurrent Results Safely
    const todayRevenue = todaySales[0]?.todayRevenue || 0;
    const monthlyRevenue = monthlySales[0]?.monthlyRevenue || 0;

    // Build the 30-day Trend Skeleton Array
    const trendData = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date(thirtyDaysAgo);
        d.setDate(d.getDate() + i);
        trendData.push({
            date: d.toISOString().split('T')[0],
            sales: 0
        });
    }

    // Map aggregated points back into the skeleton array
    salesData.forEach(sale => {
        const point = trendData.find(t => t.date === sale._id);
        if (point) point.sales = sale.dailySales;
    });

    res.json({
        todayRevenue,
        monthlyRevenue,
        totalOrders,
        lowStockCount,
        totalProducts,
        salesTrend: trendData
    });
});

// @desc    Get dashboard profit analytics
// @route   GET /api/dashboard/profit
// @access  Private
const getDashboardProfit = asyncHandler(async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [
            totalProfit,
            oneDayProfit,
            sevenDaysProfit,
            thirtyDaysProfit
        ] = await Promise.all([
            // Total Profit
            Sale.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: "$profit" } } }
            ]),
            // 1 Day Profit
            Sale.aggregate([
                { $match: { createdAt: { $gte: today }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: "$profit" } } }
            ]),
            // 7 Days Profit
            Sale.aggregate([
                { $match: { createdAt: { $gte: sevenDaysAgo }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: "$profit" } } }
            ]),
            // 30 Days Profit
            Sale.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo }, userId: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: "$profit" } } }
            ])
        ]);

        res.json({
            totalProfit: totalProfit[0]?.total || 0,
            oneDayProfit: oneDayProfit[0]?.total || 0,
            sevenDaysProfit: sevenDaysProfit[0]?.total || 0,
            thirtyDaysProfit: thirtyDaysProfit[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: "Profit fetch failed" });
    }
});

// @desc    Get top selling products
// @route   GET /api/dashboard/top-products
// @access  Private
const getTopProducts = asyncHandler(async (req, res) => {
    try {
        const topProducts = await Product.find({ userId: req.user.id })
            .sort({ totalSold: -1 })
            .limit(5)
            .select('name totalSold revenue');

        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch top products" });
    }
});

// @desc    Get low selling products (not sold recently)
// @route   GET /api/dashboard/low-selling-products
// @access  Private
const getLowSellingProducts = asyncHandler(async (req, res) => {
    try {
        // Find products that have been sold at least once but not recently
        const lowProducts = await Product.find({ lastSoldDate: { $ne: null }, userId: req.user.id })
            .sort({ lastSoldDate: 1 }) // oldest first
            .limit(5)
            .select('name lastSoldDate totalSold');

        res.json(lowProducts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch low selling products" });
    }
});

// @desc    Get profit chart data based on period
// @route   GET /api/dashboard/profit-chart
// @access  Private
const getProfitChartData = asyncHandler(async (req, res) => {
    try {
        const { period } = req.query;
        let matchStage = {};
        let groupStage = {};
        let sortStage = {};
        let formatFunction = (item) => item;

        const now = new Date();

        if (period === '1day') {
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            matchStage = { saleDate: { $gte: startOfDay } };
            groupStage = {
                _id: { hour: { $hour: "$saleDate" } },
                profit: { $sum: "$profit" }
            };
            sortStage = { "_id.hour": 1 };
            formatFunction = (item) => ({
                label: `${item._id.hour}:00`,
                profit: item.profit
            });
        } else if (period === '1week') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            matchStage = { saleDate: { $gte: sevenDaysAgo } };
            groupStage = {
                _id: {
                    year: { $year: "$saleDate" },
                    month: { $month: "$saleDate" },
                    day: { $dayOfMonth: "$saleDate" }
                },
                profit: { $sum: "$profit" }
            };
            sortStage = { "_id.year": 1, "_id.month": 1, "_id.day": 1 };
            formatFunction = (item) => {
                const date = new Date(item._id.year, item._id.month - 1, item._id.day);
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return {
                    label: days[date.getDay()],
                    profit: item.profit
                };
            };
        } else if (period === 'total') {
            matchStage = {};
            groupStage = {
                _id: { year: { $year: "$saleDate" } },
                profit: { $sum: "$profit" }
            };
            sortStage = { "_id.year": 1 };
            formatFunction = (item) => ({
                label: `${item._id.year}`,
                profit: item.profit
            });
        } else {
            // default 1year
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
            twelveMonthsAgo.setDate(1);
            twelveMonthsAgo.setHours(0, 0, 0, 0);

            matchStage = { saleDate: { $gte: twelveMonthsAgo } };
            groupStage = {
                _id: {
                    year: { $year: "$saleDate" },
                    month: { $month: "$saleDate" }
                },
                profit: { $sum: "$profit" }
            };
            sortStage = { "_id.year": 1, "_id.month": 1 };
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formatFunction = (item) => ({
                label: monthNames[item._id.month - 1],
                profit: item.profit
            });
        }

        matchStage.userId = new mongoose.Types.ObjectId(req.user.id);
        const chartData = await Sale.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: sortStage }
        ]);

        const formattedData = chartData.map(formatFunction);
        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch profit chart data" });
    }
});

module.exports = {
    getDashboardSummary,
    getDashboardProfit,
    getTopProducts,
    getLowSellingProducts,
    getProfitChartData
};
