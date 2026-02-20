import React, { useEffect, useState, useCallback } from 'react';
import KPICards from '../components/dashboard/KPICards';
import RevenueChart from '../components/dashboard/RevenueChart';
import StockStatus from '../components/dashboard/StockStatus';
import RecentSales from '../components/dashboard/RecentSales';
import ExpiryAlerts from '../components/dashboard/ExpiryAlerts';
import RecentVendorOrders from '../components/dashboard/RecentVendorOrders';
import dashboardService from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchSummary = useCallback(async () => {
        try {
            const data = await dashboardService.getSummary();
            setSummaryData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard summary", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSummary();

        // Add event listener for focus to auto-refresh when coming back to tab/window
        // This is a simple way to "refresh after sale" if user navigates away and back
        const onFocus = () => {
            fetchSummary();
        };

        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('focus', onFocus);
        };
    }, [fetchSummary]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time insights for your inventory and sales.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => navigate('/sales')}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg text-sm shadow-sm hover:bg-gray-50"
                    >
                        View Sales
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm shadow-md hover:bg-blue-700 shadow-blue-200"
                    >
                        + Manage Stock
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <KPICards data={summaryData} />

            {/* Charts & Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <RevenueChart data={summaryData?.monthlyRevenue} />
                </div>

                {/* Stock Status - Takes up 1 column */}
                <div className="lg:col-span-1">
                    <StockStatus lowStockItems={summaryData?.lowStockItems} />
                </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Sales - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <RecentSales sales={summaryData?.recentSales} />
                </div>

                {/* Alerts - Takes up 1 column */}
                <div className="lg:col-span-1 border-b lg:border-none border-gray-100 pb-6 lg:pb-0">
                    <ExpiryAlerts />
                </div>

                {/* Recent Vendor Orders - Takes up 2 columns */}
                <div className="lg:col-span-2">
                    <RecentVendorOrders orders={summaryData?.recentVendorOrders} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
