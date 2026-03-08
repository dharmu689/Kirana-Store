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

    // 4b. Total Products Count
    const totalProducts = await Product.countDocuments();

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
        totalProducts,
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

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const sevenDaysProfit = await Sale.aggregate([
            {
                $match: { createdAt: { $gte: sevenDaysAgo } }
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
        const topProducts = await Product.find()
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
        const lowProducts = await Product.find({ lastSoldDate: { $ne: null } })
            .sort({ lastSoldDate: 1 }) // oldest first
            .limit(5)
            .select('name lastSoldDate totalSold');

        res.json(lowProducts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch low selling products" });
    }
});

// @desc    Get monthly profit for the last 12 months
// @route   GET /api/dashboard/profit-year
// @access  Private
const getYearlyProfit = asyncHandler(async (req, res) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1); // Start from the 1st of that month
        twelveMonthsAgo.setHours(0, 0, 0, 0);

        const monthlyData = await Sale.aggregate([
            {
                $match: { saleDate: { $gte: twelveMonthsAgo } }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$saleDate" },
                        month: { $month: "$saleDate" }
                    },
                    profit: { $sum: "$profit" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        // Format to month abbreviations (Jan, Feb, etc.)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const formattedData = monthlyData.map(item => ({
            month: monthNames[item._id.month - 1],
            profit: item.profit
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch yearly profit" });
    }
});

module.exports = {
    getDashboardSummary,
    getDashboardProfit,
    getTopProducts,
    getLowSellingProducts,
    getYearlyProfit
};
