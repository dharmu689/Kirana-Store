const asyncHandler = require('express-async-handler');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const VendorOrder = require('../models/VendorOrder');
const Forecast = require('../models/Forecast');

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
    let { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    // Default to 30 days ago if no startDate provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    // Ensure accurate inclusive filtering by extending end date to the end of the day
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    const matchStage = {
        saleDate: {
            $gte: start,
            $lte: end
        }
    };

    // 1. Overall Metrics: totalRevenue, totalOrders
    const overallMetrics = await Sale.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalRevenueOverall: { $sum: "$totalPrice" },
                totalOrders: { $sum: 1 }
            }
        }
    ]);

    const totalRevenue = overallMetrics.length > 0 ? overallMetrics[0].totalRevenueOverall : 0;
    const totalOrders = overallMetrics.length > 0 ? overallMetrics[0].totalOrders : 0;

    // Growth calculation (Optional, returning 0 as simple default right now unless previous period logic is added)
    const salesGrowthPercentage = 0;

    // 2. Product-wise Sales
    const productWiseSalesData = await Sale.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: "$productName",
                totalQuantitySold: { $sum: "$quantitySold" },
                totalRevenue: { $sum: "$totalPrice" }
            }
        },
        { $sort: { totalRevenue: -1 } },
        {
            $project: {
                _id: 0,
                productName: "$_id",
                totalQuantitySold: 1,
                totalRevenue: 1
            }
        }
    ]);

    const topSellingProduct = productWiseSalesData.length > 0 ? productWiseSalesData[0].productName : 'N/A';

    // 3. Sales Trend Data (Grouping by Date)
    const salesTrendData = await Sale.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                revenue: { $sum: "$totalPrice" }
            }
        },
        { $sort: { "_id": 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                revenue: 1
            }
        }
    ]);

    res.json({
        totalRevenue,
        totalOrders,
        topSellingProduct,
        salesGrowthPercentage,
        salesTrend: salesTrendData,
        productWiseSales: productWiseSalesData
    });
});

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private/Admin
const getInventoryReport = asyncHandler(async (req, res) => {
    const { category } = req.query;

    const query = {};
    if (category && category !== 'All') {
        query.category = category;
    }

    const products = await Product.find(query);

    let totalStockValue = 0;
    let lowStockCount = 0;
    let mediumStockCount = 0;
    let safeStockCount = 0;

    const productInventory = products.map(product => {
        const currentStock = product.quantity;
        const costPrice = product.price; // assuming price is the cost for calculating inventory value
        const stockValue = currentStock * costPrice;

        let status = 'Safe';
        if (currentStock <= 10) {
            status = 'Low';
            lowStockCount++;
        } else if (currentStock <= 30) {
            status = 'Medium';
            mediumStockCount++;
        } else {
            safeStockCount++;
        }

        totalStockValue += stockValue;

        return {
            productName: product.name,
            category: product.category,
            currentStock,
            stockValue,
            status
        };
    });

    res.json({
        totalProducts: products.length,
        totalStockValue,
        lowStockCount,
        mediumStockCount,
        safeStockCount,
        productInventory
    });
});

// @desc    Get financial report
// @route   GET /api/reports/financial
// @access  Private/Admin
const getFinancialReport = asyncHandler(async (req, res) => {
    let { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    // Default to 30 days ago if no startDate provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    // Ensure accurate inclusive filtering by extending end date to the end of the day
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    const matchStage = {
        saleDate: {
            $gte: start,
            $lte: end
        }
    };

    const financialData = await Sale.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $project: {
                quantitySold: 1,
                totalPrice: 1,
                saleDate: 1,
                purchaseCost: { $multiply: ["$quantitySold", "$productDetails.price"] }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$saleDate" } },
                monthRevenue: { $sum: "$totalPrice" },
                monthPurchaseCost: { $sum: "$purchaseCost" },
                monthUnitsSold: { $sum: "$quantitySold" },
                monthOrders: { $sum: 1 }
            }
        },
        { $sort: { "_id": 1 } }
    ]);

    let totalRevenue = 0;
    let totalPurchaseCost = 0;
    let totalOrders = 0;
    let totalUnitsSold = 0;

    const monthlyFinancials = financialData.map(item => {
        totalRevenue += item.monthRevenue;
        totalPurchaseCost += item.monthPurchaseCost;
        totalUnitsSold += item.monthUnitsSold;
        totalOrders += item.monthOrders;

        const profit = item.monthRevenue - item.monthPurchaseCost;
        // Map to expected format
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [year, monthNum] = item._id.split('-');
        const monthStr = `${monthNames[parseInt(monthNum) - 1]} ${year}`;

        return {
            month: monthStr,
            revenue: item.monthRevenue,
            purchaseCost: item.monthPurchaseCost,
            profit: profit
        };
    });

    const totalProfit = totalRevenue - totalPurchaseCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    res.json({
        totalRevenue,
        totalPurchaseCost,
        totalProfit,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        totalOrders,
        totalUnitsSold,
        monthlyFinancials
    });
});

// @desc    Get vendor report
// @route   GET /api/reports/vendors
// @access  Private/Admin
const getVendorReport = asyncHandler(async (req, res) => {
    let { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    const matchStage = {
        orderDate: {
            $gte: start,
            $lte: end
        }
    };

    const vendorData = await VendorOrder.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $lookup: {
                from: "vendors",
                localField: "vendor",
                foreignField: "_id",
                as: "vendorDetails"
            }
        },
        { $unwind: "$vendorDetails" },
        {
            $project: {
                quantity: 1,
                vendorName: "$vendorDetails.name",
                vendorRating: "$vendorDetails.vendorRating",
                averageDeliveryDays: "$vendorDetails.averageDeliveryDays",
                amountSpent: { $multiply: ["$quantity", "$productDetails.price"] }
            }
        },
        {
            $group: {
                _id: "$vendorName",
                totalOrders: { $sum: 1 },
                totalQuantityOrdered: { $sum: "$quantity" },
                totalAmountSpent: { $sum: "$amountSpent" },
                averageDeliveryDays: { $first: "$averageDeliveryDays" },
                vendorRating: { $first: "$vendorRating" }
            }
        },
        { $sort: { totalAmountSpent: -1 } }
    ]);

    let bestVendor = "N/A";
    let highestSpendingVendor = "N/A";
    let maxOrders = 0;
    let maxSpent = 0;

    const vendorSummary = vendorData.map(item => {
        if (item.totalOrders > maxOrders) {
            maxOrders = item.totalOrders;
            bestVendor = item._id;
        }
        if (item.totalAmountSpent > maxSpent) {
            maxSpent = item.totalAmountSpent;
            highestSpendingVendor = item._id;
        }

        // deliveryPerformance synthetic score out of 100 based on averageDeliveryDays. 
        // Example: 1-2 days = 100, 3-4 days = 80, 5-6 days = 60, >7 days = 40.
        let deliveryScore = 100;
        if (item.averageDeliveryDays >= 7) deliveryScore = 40;
        else if (item.averageDeliveryDays >= 5) deliveryScore = 60;
        else if (item.averageDeliveryDays >= 3) deliveryScore = 80;

        // ratingScore / 5 * 100
        const ratingScore = (item.vendorRating / 5) * 100;

        // raw score = (totalOrders * 0.5) + (ratingScore * 0.3) + (deliveryScore * 0.2)
        // Adjust totalOrders weighting dynamically to prevent it from skewing to infinity. Max cap orders at 20.
        const orderScore = Math.min(item.totalOrders * 5, 100);

        const score = (orderScore * 0.5) + (ratingScore * 0.3) + (deliveryScore * 0.2);

        return {
            vendorName: item._id,
            totalOrders: item.totalOrders,
            totalQuantityOrdered: item.totalQuantityOrdered,
            totalAmountSpent: item.totalAmountSpent,
            averageDeliveryDays: item.averageDeliveryDays,
            performanceScore: parseFloat(score.toFixed(1))
        };
    });

    res.json({
        totalVendors: vendorSummary.length,
        bestVendor,
        highestSpendingVendor,
        vendorSummary
    });
});

// @desc    Get forecast report
// @route   GET /api/reports/forecast
// @access  Private/Admin
const getForecastReport = asyncHandler(async (req, res) => {
    let { startDate, endDate } = req.query;

    const end = endDate ? new Date(endDate) : new Date();
    // For forecasts, default to last 30 days of generated forecasts if no date is provided
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(end.getDate() - 30));

    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);

    const matchStage = {
        generatedAt: {
            $gte: start,
            $lte: end
        }
    };

    // We want to get the latest forecast per product within the date range
    const forecastData = await Forecast.aggregate([
        { $match: matchStage },
        { $sort: { generatedAt: -1 } },
        {
            $group: {
                _id: "$product",
                latestForecast: { $first: "$$ROOT" }
            }
        },
        { $replaceRoot: { newRoot: "$latestForecast" } },
        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $project: {
                productName: "$productDetails.name",
                currentStock: "$productDetails.quantity",
                predictedMonthlyDemand: 1,
                suggestedReorder: 1,
                accuracyPercentage: 1,
                trendType: 1,
                algorithmType: 1,
                generatedAt: 1,
                totalSoldLast30Days: 1
            }
        },
        { $sort: { predictedMonthlyDemand: -1 } }
    ]);

    let totalForecastedDemand = 0;
    let sumAccuracy = 0;
    let productsWithAccuracy = 0;
    let highDemandProductsCount = 0;
    let upwardTrendCount = 0;
    let downwardTrendCount = 0;

    const forecastSummary = forecastData.map(item => {
        totalForecastedDemand += item.predictedMonthlyDemand;

        if (item.accuracyPercentage !== null && item.accuracyPercentage !== undefined) {
            sumAccuracy += item.accuracyPercentage;
            productsWithAccuracy++;
        }

        if (item.predictedMonthlyDemand > item.totalSoldLast30Days) {
            highDemandProductsCount++;
        }

        if (item.trendType === 'Upward') upwardTrendCount++;
        else if (item.trendType === 'Downward') downwardTrendCount++;

        let riskStatus = "Normal";
        if (item.suggestedReorder > item.currentStock) {
            riskStatus = "Stock Risk";
        }

        return {
            productName: item.productName,
            predictedMonthlyDemand: item.predictedMonthlyDemand,
            suggestedReorder: item.suggestedReorder,
            accuracyPercentage: item.accuracyPercentage !== null ? parseFloat(item.accuracyPercentage.toFixed(1)) : null,
            trendType: item.trendType,
            algorithmType: item.algorithmType,
            generatedAt: item.generatedAt,
            riskStatus: riskStatus
        };
    });

    const averageForecastAccuracy = productsWithAccuracy > 0
        ? parseFloat((sumAccuracy / productsWithAccuracy).toFixed(1))
        : 0;

    res.json({
        totalForecastedDemand,
        averageForecastAccuracy,
        highDemandProductsCount,
        upwardTrendCount,
        downwardTrendCount,
        forecastSummary
    });
});

module.exports = {
    getSalesReport,
    getInventoryReport,
    getFinancialReport,
    getVendorReport,
    getForecastReport
};
