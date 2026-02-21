const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Forecast = require('../models/Forecast');
const VendorOrder = require('../models/VendorOrder');
const Vendor = require('../models/Vendor');

// @desc    Get all saved forecasts
// @route   GET /api/forecast
// @access  Private/Admin
const getSavedForecasts = async (req, res) => {
    try {
        const { type } = req.query;
        let dbQuery = {};
        if (type === 'regression') {
            dbQuery.algorithmType = 'Linear Regression';
        } else if (type === 'moving_average' || !type) {
            // Default load Moving Average if no explicit type requested, or depending on requirements.
            // We'll leave it loose if not specified, or strict if specified.
        }

        if (type === 'regression') {
            dbQuery.algorithmType = 'Linear Regression';
        } else if (type === 'moving_average') {
            dbQuery.algorithmType = 'Moving Average';
        } else if (type === 'hybrid') {
            dbQuery.algorithmType = 'Hybrid AI';
        }

        const forecasts = await Forecast.find(dbQuery)
            .populate('product', 'name _id quantity')
            .sort({ generatedAt: -1 });

        res.status(200).json(forecasts);
    } catch (error) {
        console.error('Error fetching forecasts:', error);
        res.status(500).json({ message: 'Server error fetching forecasts' });
    }
};

// Internal function to compute and save forecast
const computeAndSaveForecast = async (userId, algorithmType = 'Moving Average') => {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoTime = thirtyDaysAgo.getTime();

    // Aggregate tracking historical 60 day sales flat payload
    const salesDataRaw = await Sale.find({
        saleDate: { $gte: sixtyDaysAgo }
    });

    // Grouping mechanisms per product
    const productStats = {};

    salesDataRaw.forEach(sale => {
        const prodId = sale.product.toString();
        if (!productStats[prodId]) {
            productStats[prodId] = {
                totalOld: 0,
                totalRecent: 0,
                weekdays: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }, // Sun - Sat
                dailySales: Array(30).fill(0) // Day 1 to 30
            };
        }

        const isRecent = sale.saleDate >= thirtyDaysAgo;
        if (isRecent) {
            productStats[prodId].totalRecent += sale.quantitySold;

            const diffTime = sale.saleDate.getTime() - thirtyDaysAgoTime;
            let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0) {
                const idx = diffDays >= 30 ? 29 : diffDays;
                productStats[prodId].dailySales[idx] += sale.quantitySold;
            }
        } else {
            productStats[prodId].totalOld += sale.quantitySold;
        }

        // Seasonality mapping (0=Sunday ... 6=Saturday)
        const dayOfWeek = sale.saleDate.getDay();
        productStats[prodId].weekdays[dayOfWeek] += sale.quantitySold;
    });

    const generatedAt = new Date();
    const forecastsToSave = [];

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    await Promise.all(
        Object.keys(productStats).map(async (prodId) => {
            const product = await Product.findById(prodId);
            if (!product) return;

            const stats = productStats[prodId];
            const currentStock = product.quantity;
            const totalSoldLast30Days = stats.totalRecent;

            // Trend Detection Mapping
            const avgOld = stats.totalOld / 30;
            const avgRecent = stats.totalRecent / 30;

            let trendType = 'Stable';
            let trendStrength = 0;

            if (avgOld > 0 && avgRecent > avgOld * 1.15) {
                trendType = 'Upward';
                trendStrength = Number((((avgRecent - avgOld) / avgOld) * 100).toFixed(2));
            } else if (avgOld > 0 && avgRecent < avgOld * 0.85) {
                trendType = 'Downward';
                trendStrength = Number((((avgOld - avgRecent) / avgOld) * 100).toFixed(2));
            } else if (avgOld === 0 && avgRecent > 0) {
                trendType = 'Upward';
                trendStrength = 100;
            }

            // Seasonality Mapping
            let totalWeeklyArr = Object.values(stats.weekdays);
            let totalWeeklySum = totalWeeklyArr.reduce((a, b) => a + b, 0);
            let avgWeekday = totalWeeklySum / 7;

            let seasonalPeakDay = 'None';
            let seasonalImpactPercentage = 0;
            let highestDayValue = -1;
            let highestDayIndex = -1;

            totalWeeklyArr.forEach((val, idx) => {
                if (val > highestDayValue) {
                    highestDayValue = val;
                    highestDayIndex = idx;
                }
            });

            if (avgWeekday > 0 && highestDayValue > avgWeekday * 1.30) {
                seasonalPeakDay = dayNames[highestDayIndex];
                seasonalImpactPercentage = Number((((highestDayValue - avgWeekday) / avgWeekday) * 100).toFixed(2));
            }

            // Base MA values
            const avgDailyDemand = Number((totalSoldLast30Days / 30).toFixed(2));
            let maMonthlyDemand = avgDailyDemand * 30;

            if (trendType === 'Upward') {
                maMonthlyDemand *= 1.10;
            } else if (trendType === 'Downward') {
                maMonthlyDemand *= 0.90;
            }
            let movingAverageForecast = Number(maMonthlyDemand.toFixed(2));

            // LR Calculation
            const N = 30;
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            let sumY2 = 0;

            stats.dailySales.forEach((y, idx) => {
                const x = idx + 1; // Day 1 to 30
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumX2 += x * x;
                sumY2 += y * y;
            });

            const denominator = (N * sumX2) - (sumX * sumX);
            let m = 0;
            let b = 0;
            let rSquared = 0;

            if (denominator !== 0) {
                m = ((N * sumXY) - (sumX * sumY)) / denominator;
                b = (sumY - (m * sumX)) / N;

                const meanY = sumY / N;
                let ssTot = 0;
                let ssRes = 0;
                stats.dailySales.forEach((y, idx) => {
                    const x = idx + 1;
                    const yPred = (m * x) + b;
                    ssTot += Math.pow(y - meanY, 2);
                    ssRes += Math.pow(y - yPred, 2);
                });

                if (ssTot !== 0) {
                    rSquared = 1 - (ssRes / ssTot);
                } else {
                    rSquared = 1;
                }
            } else {
                b = sumY / N;
            }

            let regressionSlope = Number(m.toFixed(4));
            let regressionIntercept = Number(b.toFixed(4));

            let totalPredictedLR = 0;
            for (let futureDay = 31; futureDay <= 60; futureDay++) {
                let dailyPred = (m * futureDay) + b;
                if (dailyPred < 0) dailyPred = 0;
                totalPredictedLR += dailyPred;
            }

            let regressionForecast = Number(totalPredictedLR.toFixed(2));
            let regressionForecastValue = regressionForecast;

            // Hybrid Calculation
            // Get last accuracy
            const lastForecast = await Forecast.findOne({ product: prodId }).sort({ generatedAt: -1 });
            const lastAccuracy = lastForecast ? lastForecast.accuracyPercentage : null;

            let w_lr = 0.5;
            let w_ma = 0.4;
            let w_sa = 0.1;

            if (lastAccuracy !== null && lastAccuracy < 70) {
                w_lr = 0.6;
                w_ma = 0.3;
                w_sa = 0.1;
            } else if (lastAccuracy !== null && lastAccuracy > 85) {
                w_lr = 0.5;
                w_ma = 0.4;
                w_sa = 0.1;
            }

            let seasonalAdjustment = Number((movingAverageForecast * (seasonalImpactPercentage / 100)).toFixed(2));
            let hybridForecast = Number(((movingAverageForecast * w_ma) + (regressionForecast * w_lr) + (seasonalAdjustment * w_sa)).toFixed(2));

            let predictedMonthlyDemand = 0;
            let confidenceLevel = 60;

            if (algorithmType === 'Hybrid AI') {
                predictedMonthlyDemand = hybridForecast;
                if (rSquared > 0.7 && totalSoldLast30Days > 50) confidenceLevel = 95;
                else if (rSquared > 0.4) confidenceLevel = 80;
                else confidenceLevel = 75;
            } else if (algorithmType === 'Linear Regression') {
                predictedMonthlyDemand = regressionForecast;
                if (rSquared > 0.7) confidenceLevel = 90;
                else if (rSquared > 0.4) confidenceLevel = 75;
                else confidenceLevel = 60;
            } else {
                // Moving Average
                predictedMonthlyDemand = movingAverageForecast;
                if (seasonalImpactPercentage > 20) {
                    predictedMonthlyDemand *= 1.05; // +5% modifier for standard MA
                }
                predictedMonthlyDemand = Number(predictedMonthlyDemand.toFixed(2));

                if (totalSoldLast30Days > 50) {
                    confidenceLevel = 90;
                } else if (totalSoldLast30Days > 20) {
                    confidenceLevel = 75;
                }
            }

            let suggestedReorder = 0;
            if (predictedMonthlyDemand > currentStock) {
                suggestedReorder = Math.ceil(predictedMonthlyDemand - currentStock);
            }

            const newForecast = new Forecast({
                product: product._id,
                totalSoldLast30Days,
                avgDailyDemand,
                predictedMonthlyDemand,
                suggestedReorder,
                confidenceLevel,
                trendType,
                trendStrength,
                seasonalPeakDay,
                seasonalImpactPercentage,
                algorithmType,
                regressionSlope,
                regressionIntercept,
                regressionForecastValue,
                movingAverageForecast,
                regressionForecast,
                seasonalAdjustment,
                hybridForecast,
                generatedAt,
                createdBy: userId
            });

            forecastsToSave.push(newForecast);
        })
    );

    if (forecastsToSave.length > 0) {
        await Forecast.insertMany(forecastsToSave);
    }

    return await Forecast.find({ generatedAt })
        .populate('product', 'name _id quantity')
        .sort({ predictedMonthlyDemand: -1 });
};

// @desc    Generate a new forecast (retains history)
// @route   POST /api/forecast/generate
// @access  Private/Admin
const generateForecast = async (req, res) => {
    try {
        const type = req.query.type === 'hybrid' ? 'Hybrid AI' : req.query.type === 'regression' ? 'Linear Regression' : 'Moving Average';
        const newForecasts = await computeAndSaveForecast(req.user._id, type);
        res.status(201).json(newForecasts);
    } catch (error) {
        console.error('Error generating forecast:', error);
        res.status(500).json({ message: 'Server error generating forecast data' });
    }
};

// @desc    Regenerate forecast (deletes all previous history)
// @route   PUT /api/forecast/regenerate
// @access  Private/Admin
const regenerateForecast = async (req, res) => {
    try {
        // Delete old history
        await Forecast.deleteMany({});

        const type = req.query.type === 'hybrid' ? 'Hybrid AI' : req.query.type === 'regression' ? 'Linear Regression' : 'Moving Average';
        const newForecasts = await computeAndSaveForecast(req.user._id, type);
        res.status(200).json(newForecasts);
    } catch (error) {
        console.error('Error regenerating forecast:', error);
        res.status(500).json({ message: 'Server error regenerating forecast data' });
    }
};

// @desc    Get 30-day sales trend for a specific product
// @route   GET /api/forecast/:productId/trend
// @access  Private/Admin
const getProductTrend = async (req, res) => {
    try {
        const { productId } = req.params;

        // Verify product and grab forecasted metric if it exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const latestForecast = await Forecast.findOne({ product: productId }).sort({ generatedAt: -1 });
        const predictedDemand = latestForecast ? latestForecast.avgDailyDemand : 0;

        // Generate baseline 30-day date array
        const trendData = [];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29); // Include today (30 days total)
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Pre-fill last 30 days
        for (let i = 0; i < 30; i++) {
            const currentDate = new Date(thirtyDaysAgo);
            currentDate.setDate(currentDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];

            trendData.push({
                date: dateString,
                actualSales: 0,
                predictedDemand: predictedDemand,
                hybridForecastDemand: predictedDemand
            });
        }

        // Aggregate actual sales data
        const salesData = await Sale.aggregate([
            {
                $match: {
                    product: product._id,
                    saleDate: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                    dailySales: { $sum: "$quantitySold" }
                }
            }
        ]);

        // Merge raw DB sales into baseline array
        salesData.forEach(sale => {
            const dataPoint = trendData.find(t => t.date === sale._id);
            if (dataPoint) {
                dataPoint.actualSales = sale.dailySales;
            }
        });

        // Apply regression line values onto UI graph mapping if product was mathematically analyzed via Regression
        const isRegression = latestForecast && latestForecast.algorithmType === 'Linear Regression';
        const isHybrid = latestForecast && latestForecast.algorithmType === 'Hybrid AI';

        if ((isRegression || isHybrid) && latestForecast.regressionSlope !== null && latestForecast.regressionIntercept !== null) {
            const m = latestForecast.regressionSlope;
            const b = latestForecast.regressionIntercept;

            trendData.forEach((point, idx) => {
                const x = idx + 1;
                let yPred = (m * x) + b;
                if (yPred < 0) yPred = 0;
                point.predictedDemand = Number(yPred.toFixed(2));

                if (isHybrid) {
                    // For UI, we simply distribute the monthly hybrid forecast back down linearly or statically. 
                    // Let's accurately map it statically flat as hybrid Daily, since linear scales uniquely.
                    point.hybridForecastDemand = Number((latestForecast.hybridForecast / 30).toFixed(2));
                }
            });
        }

        // Aggregate weekly distribution mapping raw Date queries (1 = Sunday in Mongo vs 0 JS) 
        const weeklyData = await Sale.aggregate([
            {
                $match: {
                    product: product._id,
                    saleDate: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$saleDate" },
                    totalSales: { $sum: "$quantitySold" }
                }
            }
        ]);

        const weeklyDistribution = [
            { day: 'Sun', sales: 0 },
            { day: 'Mon', sales: 0 },
            { day: 'Tue', sales: 0 },
            { day: 'Wed', sales: 0 },
            { day: 'Thu', sales: 0 },
            { day: 'Fri', sales: 0 },
            { day: 'Sat', sales: 0 },
        ];

        weeklyData.forEach(item => {
            // Mongo $dayOfWeek returns 1 (Sunday) to 7 (Saturday)
            const jsIndex = item._id - 1;
            if (jsIndex >= 0 && jsIndex <= 6) {
                weeklyDistribution[jsIndex].sales = item.totalSales;
            }
        });

        res.status(200).json({ trendData, weeklyDistribution });
    } catch (error) {
        console.error('Error fetching product trend:', error);
        res.status(500).json({ message: 'Server error generating trend visualization data' });
    }
};

// Internal helper to evaluate single forecast
const evaluateSingleForecast = async (forecast) => {
    // Determine the end date (30 days after generation) or current date (if less than 30 days)
    const endDate = new Date(forecast.generatedAt);
    endDate.setDate(endDate.getDate() + 30);
    const currentDate = new Date();
    const finalDate = endDate > currentDate ? currentDate : endDate;

    // Aggregate sales strictly generated after the prediction till the max window ends
    const salesData = await Sale.aggregate([
        {
            $match: {
                product: forecast.product,
                saleDate: {
                    $gte: forecast.generatedAt,
                    $lte: finalDate
                }
            }
        },
        {
            $group: {
                _id: null,
                totalActualSales: { $sum: "$quantitySold" }
            }
        }
    ]);

    const actualSales = salesData.length > 0 ? salesData[0].totalActualSales : 0;

    // Formula calculation
    let accuracy = 0;
    const predicted = forecast.predictedMonthlyDemand;

    if (predicted > 0) {
        let diff = Math.abs(predicted - actualSales);
        accuracy = 100 - (diff / predicted) * 100;

        // Bind 0-100 logic
        if (accuracy < 0) accuracy = 0;
        if (accuracy > 100) accuracy = 100;
    } else if (predicted === 0 && actualSales === 0) {
        accuracy = 100; // Correctly guessed 0
    } else {
        accuracy = 0; // Missed
    }

    forecast.actualSalesAfterForecast = actualSales;
    forecast.accuracyPercentage = Number(accuracy.toFixed(2));
    forecast.evaluationDate = new Date();

    return await forecast.save();
};

// @desc    Evaluate a specific forecast history item
// @route   PUT /api/forecast/:id/evaluate
// @access  Private/Admin
const evaluateForecast = async (req, res) => {
    try {
        const forecast = await Forecast.findById(req.params.id);
        if (!forecast) {
            return res.status(404).json({ message: 'Forecast not found' });
        }

        const updatedForecast = await evaluateSingleForecast(forecast);

        // Repopulate for return consistency
        const populatedForecast = await Forecast.findById(updatedForecast._id).populate('product', 'name _id quantity');

        res.status(200).json(populatedForecast);
    } catch (error) {
        console.error('Error evaluating forecast:', error);
        res.status(500).json({ message: 'Server error evaluating forecast accuracy' });
    }
};

// @desc    Evaluate all historical forecasts
// @route   POST /api/forecast/evaluate-all
// @access  Private/Admin
const evaluateAllForecasts = async (req, res) => {
    try {
        const forecasts = await Forecast.find();

        await Promise.all(
            forecasts.map(async (forecast) => {
                await evaluateSingleForecast(forecast);
            })
        );

        res.status(200).json({ message: 'All forecasts successfully evaluated.' });
    } catch (error) {
        console.error('Error evaluating all forecasts:', error);
        res.status(500).json({ message: 'Server error batch evaluating forecast arrays' });
    }
};

module.exports = {
    getSavedForecasts,
    generateForecast,
    regenerateForecast,
    getProductTrend,
    evaluateForecast,
    evaluateAllForecasts
};
