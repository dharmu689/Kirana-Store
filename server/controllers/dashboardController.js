const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const VendorOrder = require('../models/VendorOrder');
const Vendor = require('../models/Vendor');
const Forecast = require('../models/Forecast');

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
    const deliveredVendorOrdersCount = await VendorOrder.countDocuments({ status: 'Delivered' });

    // 8. Recent Vendor Orders (Top 5)
    const recentVendorOrders = await VendorOrder.find()
        .sort({ orderDate: -1 })
        .limit(5)
        .populate('product', 'name')
        .populate('vendor', 'name');

    // 9. Vendor Efficiency KPIs globally
    const vendors = await Vendor.find({});

    let avgVendorRating = 0;
    let avgDeliveryDays = 0;
    let mostCostEffectiveVendor = null;

    if (vendors.length > 0) {
        let totalRating = 0;
        let totalDelivery = 0;
        let bestPrice = Infinity;

        vendors.forEach(v => {
            totalRating += (v.vendorRating || 3);
            totalDelivery += (v.averageDeliveryDays || 1);

            if (v.pricePerUnit < bestPrice && v.pricePerUnit > 0) {
                bestPrice = v.pricePerUnit;
                mostCostEffectiveVendor = v.name;
            }
        });

        avgVendorRating = Number((totalRating / vendors.length).toFixed(1));
        avgDeliveryDays = Number((totalDelivery / vendors.length).toFixed(1));
    }

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
        deliveredVendorOrdersCount,
        recentVendorOrders,
        vendorKPIs: {
            avgVendorRating,
            avgDeliveryDays,
            mostCostEffectiveVendor: mostCostEffectiveVendor || 'N/A'
        }
    });
});

// @desc    Get comprehensive dashboard analytics (Phase 10)
// @route   GET /api/dashboard/analytics
// @access  Private
const getDashboardAnalytics = asyncHandler(async (req, res) => {
    // 1. Core Product & Sales
    const totalProducts = await Product.countDocuments();

    // Last 30 Days Sales & Revenue
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesStats = await Sale.aggregate([
        { $match: { saleDate: { $gte: thirtyDaysAgo } } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$totalPrice' },
                totalSalesCount: { $sum: '$quantitySold' } // Total quantity sold
            }
        }
    ]);

    const totalRevenue = salesStats[0]?.totalRevenue || 0;
    const totalSales30d = salesStats[0]?.totalSalesCount || 0;

    // 2. Forecasting & Risk Meta
    const latestForecasts = await Forecast.aggregate([
        { $sort: { generatedAt: -1 } },
        { $group: { _id: '$product', latest: { $first: '$$ROOT' } } }
    ]);

    let totalForecastedDemand = 0;
    let totalAccuracy = 0;
    let evaluatedCount = 0;
    let autoReordersTriggeredCount = 0; // Derived from pending orders for simplicity, or DB query
    let upTrend = 0, downTrend = 0, stableTrend = 0;

    latestForecasts.forEach(f => {
        totalForecastedDemand += f.latest.predictedMonthlyDemand || 0;

        if (f.latest.accuracyPercentage && f.latest.accuracyPercentage > 0) {
            totalAccuracy += f.latest.accuracyPercentage;
            evaluatedCount++;
        }

        if (f.latest.trendType === 'Upward') upTrend++;
        else if (f.latest.trendType === 'Downward') downTrend++;
        else stableTrend++;
    });

    const averageForecastAccuracy = evaluatedCount > 0 ? Number((totalAccuracy / evaluatedCount).toFixed(1)) : 0;
    const pendingVendorOrdersCount = await VendorOrder.countDocuments({ status: 'Pending' });

    // 3. Risk & Health Metrics
    let highRiskCount = 0;
    let lowStockCount = 0;

    const products = await Product.find({});
    products.forEach(p => {
        if (p.quantity <= p.reorderLevel) lowStockCount++;
        // Fast risk calculation matching Phase 7 logic
        const f = latestForecasts.find(lf => lf._id.toString() === p._id.toString());
        if (f) {
            const daily = (f.latest.predictedMonthlyDemand || 0) / 30;
            const reorderPoint = (daily * (p.leadTimeDays || 7)) + (p.safetyStock || 10);
            if (p.quantity < (reorderPoint * 0.5)) {
                highRiskCount++;
            }
        }
    });

    // 4. Vendor Performance
    const vendors = await Vendor.find({});
    let mostCostEffectiveVendor = 'N/A';
    let bestVendorScore = -1;

    if (vendors.length > 0) {
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        vendors.forEach(v => {
            const p = v.pricePerUnit || 1;
            if (p < minPrice) minPrice = p;
            if (p > maxPrice) maxPrice = p;
        });
        if (minPrice === maxPrice) maxPrice = minPrice + 1;

        vendors.forEach(v => {
            const cPrice = v.pricePerUnit || minPrice;
            const pScore = 100 - (((cPrice - minPrice) / (maxPrice - minPrice)) * 100);
            if (pScore > bestVendorScore) {
                bestVendorScore = pScore;
                mostCostEffectiveVendor = v.name;
            }
        });
    }

    res.json({
        totalProducts,
        totalSales30d,
        totalRevenue,
        totalForecastedDemand: Number(totalForecastedDemand.toFixed(0)),
        averageForecastAccuracy,
        highRiskProductsCount: highRiskCount,
        autoReordersTriggeredCount: pendingVendorOrdersCount, // Using pending as proxy for auto triggers
        bestPerformingVendor: mostCostEffectiveVendor,
        lowStockItemsCount: lowStockCount,
        trendDistribution: {
            upward: upTrend,
            stable: stableTrend,
            downward: downTrend
        }
    });
});

// @desc    Get Sales Trend (Last 30 days)
// @route   GET /api/dashboard/sales-trend
// @access  Private
const getSalesTrend = asyncHandler(async (req, res) => {
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
                dailySales: { $sum: "$quantitySold" }
            }
        }
    ]);

    salesData.forEach(sale => {
        const point = trendData.find(t => t.date === sale._id);
        if (point) point.sales = sale.dailySales;
    });

    res.json(trendData);
});

// @desc    Get Inventory Health
// @route   GET /api/dashboard/inventory-health
// @access  Private
const getInventoryHealth = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    const latestForecasts = await Forecast.aggregate([
        { $sort: { generatedAt: -1 } },
        { $group: { _id: '$product', latest: { $first: '$$ROOT' } } }
    ]);

    let safe = 0;
    let medium = 0;
    let high = 0;

    products.forEach(p => {
        const f = latestForecasts.find(lf => lf._id.toString() === p._id.toString());
        let risk = 'Low'; // Default Safe

        if (f) {
            const daily = (f.latest.predictedMonthlyDemand || 0) / 30;
            const reorderPoint = (daily * (p.leadTimeDays || 7)) + (p.safetyStock || 10);

            if (p.quantity < (reorderPoint * 0.5)) risk = 'High';
            else if (p.quantity < reorderPoint) risk = 'Medium';
        } else {
            // Fallback
            if (p.quantity === 0) risk = 'High';
            else if (p.quantity <= p.reorderLevel) risk = 'Medium';
        }

        if (risk === 'High') high++;
        else if (risk === 'Medium') medium++;
        else safe++;
    });

    const total = products.length || 1;
    res.json([
        { name: 'Safe Stock', value: Number(((safe / total) * 100).toFixed(1)), count: safe },
        { name: 'Medium Risk', value: Number(((medium / total) * 100).toFixed(1)), count: medium },
        { name: 'High Risk', value: Number(((high / total) * 100).toFixed(1)), count: high }
    ]);
});

module.exports = {
    getDashboardSummary,
    getDashboardAnalytics,
    getSalesTrend,
    getInventoryHealth
};
