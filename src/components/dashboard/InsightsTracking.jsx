import React from 'react';
import { Lightbulb, AlertCircle, ArrowUpRight, ArrowDownRight, Minus, Package, AlertTriangle, Truck } from 'lucide-react';

export const SmartInsightsPanel = ({ data }) => {
    // Generate intelligent insights based on the available analytics data limits explicitly
    const insights = [];

    if (data) {
        // Forecast Accuracy Insight
        if (data.averageForecastAccuracy > 80) {
            insights.push({
                type: 'success',
                text: `System forecasting is highly accurate (${data.averageForecastAccuracy}%), optimizing capital.`,
                icon: <ArrowUpRight className="text-emerald-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            });
        } else if (data.averageForecastAccuracy > 0) {
            insights.push({
                type: 'warning',
                text: `AI prediction accuracy is currently ${data.averageForecastAccuracy}%. The Hybrid model is self-correcting.`,
                icon: <Minus className="text-yellow-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            });
        }

        // Trend Distribution Insight
        if (data.trendDistribution?.upward > data.trendDistribution?.downward * 2) {
            insights.push({
                type: 'success',
                text: `Strong catalog growth: ${data.trendDistribution.upward} products are tracking upward sales trends.`,
                icon: <ArrowUpRight className="text-emerald-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            });
        }

        // Vendor Insight
        if (data.bestPerformingVendor && data.bestPerformingVendor !== 'N/A') {
            insights.push({
                type: 'info',
                text: `AI Vendor Logic recommends prioritizing ${data.bestPerformingVendor} for optimal ROI.`,
                icon: <Package className="text-indigo-500 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            });
        }
    }

    // Fallbacks if not enough info generated
    if (insights.length === 0) {
        insights.push({
            type: 'neutral',
            text: 'System gathering intelligent trajectory loops...',
            icon: <Lightbulb className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
        });
    }

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm border border-indigo-100">
            <div className="flex items-center mb-5">
                <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <Lightbulb className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-indigo-900">AI Logic Insights</h3>
            </div>

            <div className="space-y-4">
                {insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start bg-white p-4 rounded-lg shadow-sm border border-indigo-50/50">
                        {insight.icon}
                        <p className="text-sm font-medium text-gray-700 leading-snug">{insight.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const RiskAlertPanel = ({ lowStockItems }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100/50">
            <div className="flex items-center mb-5">
                <div className="bg-red-50 p-2 rounded-lg mr-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Immediate Risk Matrix</h3>
            </div>

            {lowStockItems && lowStockItems.length > 0 ? (
                <div className="overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {lowStockItems.map((item, idx) => (
                            <li key={item._id || idx} className="py-3 flex justify-between items-center group">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Threshold: {item.reorderLevel}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.quantity === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} Left`}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg flex items-center text-sm font-medium border border-emerald-100">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    All inventory nodes operating securely.
                </div>
            )}
        </div>
    );
};
