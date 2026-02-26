import React, { useEffect, useState, useCallback } from 'react';
import KPICards from '../components/dashboard/KPICards';
import dashboardService from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Dashboard = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { language } = useLanguage();
    const t = translations[language];

    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getSummary();
            setSummaryData(data);
        } catch (error) {
            console.error("Failed to fetch dashboard summary", error);
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
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-800/50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Loading Dashboard...</h2>
                <p className="text-sm text-gray-500 mt-2">Aggregating Summary Data</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
                        <Activity className="w-6 h-6 mr-3 text-indigo-600 dark:text-indigo-400" />
                        {t.dashboard || "Dashboard"}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Complete System Overview</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <button
                        onClick={() => navigate('/forecasting')}
                        className="px-4 py-2 bg-indigo-50 dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg text-sm shadow-sm hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                        <TrendingUp className="w-4 h-4 mr-2" /> {t.forecasting || "View Forecasts"}
                    </button>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg text-sm shadow-md hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        {t.products || "Products"} <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </div>

            {/* Row 1 - KPI Cards */}
            <KPICards data={summaryData} />

            {/* Row 2 - Sales Trend Chart */}
            {/* <div className="w-full h-80 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Sales Trend (30 Days)</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={summaryData?.salesTrend || []} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(str) => str?.slice(5) || ''} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                        <Line type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div> */
            

            <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mt-6">

  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
    Sales Trend
  </h2>

  <div className="w-full h-[350px] min-h-[300px]">

    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={summary?.salesTrend || []}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>

  </div>

</div>
            }
        </div>
    );
};

export default Dashboard;
