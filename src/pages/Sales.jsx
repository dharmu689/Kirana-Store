import { useState, useEffect } from 'react';
import SaleForm from '../components/SaleForm';
import SalesTable from '../components/SalesTable';
import salesService from '../services/salesService';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Sales = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalSalesCount: 0,
        monthlyBreakdown: []
    });

    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            const salesData = await salesService.getSales();
            const summaryData = await salesService.getSalesSummary();
            setSales(salesData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    // Prepare chart data
    const chartData = {
        labels: summary.monthlyBreakdown.map(item => {
            const date = new Date();
            date.setMonth(item._id - 1);
            return date.toLocaleString('default', { month: 'short' });
        }),
        datasets: [
            {
                label: 'Monthly Revenue',
                data: summary.monthlyBreakdown.map(item => item.revenue),
                borderColor: 'var(--color-brand-blue)',
                backgroundColor: 'rgba(56, 113, 193, 0.2)',
                tension: 0.3
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Revenue Trend',
            },
        },
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">{t.sales || "Sales Management"}</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border-l-4 border-l-[var(--color-brand-green)] border-gray-100 dark:border-gray-800 hover-mac-folder cursor-default">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t.totalRevenue || "Total Revenue"}</h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">₹{summary.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border-l-4 border-l-[var(--color-brand-blue)] border-gray-100 dark:border-gray-800 hover-mac-folder cursor-default">
                    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t.totalSales || "Total Sales Count"}</h3>
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">{summary.totalSalesCount}</p>
                </div>
                <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover-mac-folder cursor-default">
                    <div className="h-24">
                        {summary.monthlyBreakdown.length > 0 ? (
                            <Line options={{ ...chartOptions, maintainAspectRatio: false }} data={chartData} />
                        ) : (
                            <p className="text-center text-gray-500 pt-8">No data for chart</p>
                        )}
                    </div>
                </div>
            </div>

            <SaleForm onSaleAdded={fetchSalesData} />

            <SalesTable sales={sales} />
        </div>
    );
};

export default Sales;
