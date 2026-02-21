import React, { useEffect, useState, useCallback } from 'react';
import KPICards from '../components/dashboard/KPICards';
import dashboardService from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { SalesTrendChart, ForecastAccuracyChart, InventoryHealthChart, VendorPerformanceChart } from '../components/dashboard/BICharts';
import { SmartInsightsPanel, RiskAlertPanel } from '../components/dashboard/InsightsTracking';
import { ArrowRight, Activity, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [inventoryHealth, setInventoryHealth] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const [analytics, trend, health] = await Promise.all([
                dashboardService.getAnalytics(),
                dashboardService.getSalesTrend(),
                dashboardService.getInventoryHealth()
            ]);

            setAnalyticsData(analytics);
            setSalesTrend(trend);
            setInventoryHealth(health);
        } catch (error) {
            console.error("Failed to fetch Final BI components", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();

        const onFocus = () => {
            fetchAllData();
        };

        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchAllData]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50/50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-bold text-gray-700">Loading Business Intelligence Suite...</h2>
                <p className="text-sm text-gray-500 mt-2">Aggregating Global APIs</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200/60">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center">
                        <Activity className="w-6 h-6 mr-3 text-indigo-600" />
                        Final AI Intelligence Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Phase 10: Complete System Overview & Real-time Logistics</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => navigate('/forecasting')}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded-lg text-sm shadow-sm hover:bg-indigo-100 transition-colors flex items-center"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" /> View Forecasts
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm shadow-md hover:bg-indigo-700 shadow-indigo-200 transition-colors flex items-center"
                    >
                        Manage Stock <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* KPI Cards section (Phase 10 Grid) */}
            <KPICards data={analyticsData} />

            {/* Middle BI Row: Primary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesTrendChart data={salesTrend} />
                <InventoryHealthChart data={inventoryHealth} />
            </div>

            {/* Bottom BI Row: Intelligence and Risk Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1 col */}
                <div className="lg:col-span-1">
                    <RiskAlertPanel lowStockItems={analyticsData?.lowStockItems} />
                    <div className="mt-6">
                        <ForecastAccuracyChart data={analyticsData?.averageForecastAccuracy} />
                    </div>
                </div>

                {/* 2 cols */}
                <div className="lg:col-span-2 space-y-6">
                    <VendorPerformanceChart />
                    <SmartInsightsPanel data={analyticsData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
