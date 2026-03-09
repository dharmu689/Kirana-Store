const mongoose = require('mongoose');

const forecastSchema = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        totalSoldLast30Days: {
            type: Number,
            default: 0
        },
        avgDailyDemand: {
            type: Number,
            default: 0
        },
        predictedMonthlyDemand: {
            type: Number,
            default: 0
        },
        suggestedReorder: {
            type: Number,
            default: 0
        },
        confidenceLevel: {
            type: Number,
            default: 60
        },
        trendType: {
            type: String,
            enum: ['Upward', 'Downward', 'Stable'],
            default: 'Stable'
        },
        seasonalPeakDay: {
            type: String,
            default: 'None'
        },
        trendStrength: {
            type: Number,
            default: 0
        },
        seasonalImpactPercentage: {
            type: Number,
            default: 0
        },
        regressionSlope: {
            type: Number,
            default: null
        },
        regressionIntercept: {
            type: Number,
            default: null
        },
        regressionForecastValue: {
            type: Number,
            default: null
        },
        algorithmType: {
            type: String,
            enum: ['Moving Average', 'Linear Regression', 'Hybrid AI', 'Prophet ML'],
            default: 'Moving Average'
        },
        prophetDailyPredictions: [
            {
                date: String,
                predictedDemand: Number
            }
        ],
        movingAverageForecast: {
            type: Number,
            default: null
        },
        regressionForecast: {
            type: Number,
            default: null
        },
        seasonalAdjustment: {
            type: Number,
            default: null
        },
        hybridForecast: {
            type: Number,
            default: null
        },
        actualSalesAfterForecast: {
            type: Number,
            default: 0
        },
        accuracyPercentage: {
            type: Number,
            default: null
        },
        evaluationDate: {
            type: Date
        },
        generatedAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Add compound index for efficient querying
forecastSchema.index({ product: 1, generatedAt: -1 });

module.exports = mongoose.model('Forecast', forecastSchema);
