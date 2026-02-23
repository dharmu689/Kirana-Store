import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Calendar, Download, FileText, TrendingUp, DollarSign, ShoppingCart, Award, Package, AlertTriangle, CheckCircle, BarChart2, Wallet, CreditCard, PieChart as PieChartIcon, Users, Truck, Activity, TrendingDown, Target } from 'lucide-react';

const COLORS = ['#10b981', '#ef4444', '#9ca3af']; // Green (Upward), Red (Downward), Gray (Stable)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Reports = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [inventoryData, setInventoryData] = useState(null);
    const [inventoryFilter, setInventoryFilter] = useState('All');
    const [loadingInventory, setLoadingInventory] = useState(false);
    const [inventoryError, setInventoryError] = useState('');

    const [financialData, setFinancialData] = useState(null);
    const [financialStartDate, setFinancialStartDate] = useState('');
    const [financialEndDate, setFinancialEndDate] = useState('');
    const [loadingFinancial, setLoadingFinancial] = useState(false);
    const [financialError, setFinancialError] = useState('');

    const [vendorData, setVendorData] = useState(null);
    const [vendorStartDate, setVendorStartDate] = useState('');
    const [vendorEndDate, setVendorEndDate] = useState('');
    const [loadingVendor, setLoadingVendor] = useState(false);
    const [vendorError, setVendorError] = useState('');

    const [forecastData, setForecastData] = useState(null);
    const [forecastStartDate, setForecastStartDate] = useState('');
    const [forecastEndDate, setForecastEndDate] = useState('');
    const [loadingForecast, setLoadingForecast] = useState(false);
    const [forecastError, setForecastError] = useState('');

    const fetchReport = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {}
            };

            if (startDate) config.params.startDate = startDate;
            if (endDate) config.params.endDate = endDate;

            const { data } = await axios.get(`${API_URL}/api/reports/sales`, config);
            setReportData(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    const fetchInventoryReport = async () => {
        try {
            setLoadingInventory(true);
            setInventoryError('');

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const { data } = await axios.get(`${API_URL}/api/reports/inventory`, config);
            setInventoryData(data);
        } catch (err) {
            console.error(err);
            setInventoryError(err.response?.data?.message || 'Failed to fetch inventory report');
        } finally {
            setLoadingInventory(false);
        }
    };

    const fetchFinancialReport = async () => {
        try {
            setLoadingFinancial(true);
            setFinancialError('');

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {}
            };

            if (financialStartDate) config.params.startDate = financialStartDate;
            if (financialEndDate) config.params.endDate = financialEndDate;

            const { data } = await axios.get(`${API_URL}/api/reports/financial`, config);
            setFinancialData(data);
        } catch (err) {
            console.error(err);
            setFinancialError(err.response?.data?.message || 'Failed to fetch financial report');
        } finally {
            setLoadingFinancial(false);
        }
    };

    const fetchVendorReport = async () => {
        try {
            setLoadingVendor(true);
            setVendorError('');

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {}
            };

            if (vendorStartDate) config.params.startDate = vendorStartDate;
            if (vendorEndDate) config.params.endDate = vendorEndDate;

            const { data } = await axios.get(`${API_URL}/api/reports/vendors`, config);
            setVendorData(data);
        } catch (err) {
            console.error(err);
            setVendorError(err.response?.data?.message || 'Failed to fetch vendor report');
        } finally {
            setLoadingVendor(false);
        }
    };

    const fetchForecastReport = async () => {
        try {
            setLoadingForecast(true);
            setForecastError('');

            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {}
            };

            if (forecastStartDate) config.params.startDate = forecastStartDate;
            if (forecastEndDate) config.params.endDate = forecastEndDate;

            const { data } = await axios.get(`${API_URL}/api/reports/forecast`, config);
            setForecastData(data);
        } catch (err) {
            console.error(err);
            setForecastError(err.response?.data?.message || 'Failed to fetch forecast report');
        } finally {
            setLoadingForecast(false);
        }
    };

    useEffect(() => {
        // Fetch default report (last 30 days) on mount
        fetchReport();
        fetchInventoryReport();
        fetchFinancialReport();
        fetchVendorReport();
        fetchForecastReport();
    }, []);

    const handleGenerateReport = () => {
        fetchReport();
    };

    const handleGenerateFinancialReport = () => {
        fetchFinancialReport();
    };

    const handleGenerateVendorReport = () => {
        fetchVendorReport();
    };

    const handleGenerateForecastReport = () => {
        fetchForecastReport();
    };

    const handleExportCSV = () => {
        // Placeholder CSV Export logic
        if (!reportData || !reportData.productWiseSales) return;

        const headers = ['Product Name,Quantity Sold,Revenue Generated'];
        const rows = reportData.productWiseSales.map(item =>
            `"${item.productName}",${item.totalQuantitySold},${item.totalRevenue}`
        );

        const csvContent = headers.concat(rows).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `sales_report_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        // Placeholder PDF Export logic
        alert('PDF Export functionality coming soon!');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sales Reports</h1>

                {/* Export Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto shadow-sm"
                    >
                        <FileText size={18} />
                        Export CSV
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto shadow-sm"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-indigo-500" />
                    Filter Report
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading}
                            className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 font-medium"
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            {reportData && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    ₹{reportData.totalRevenue?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <ShoppingCart size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-800">{reportData.totalOrders || 0}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Top Selling Product</p>
                                <p className="text-lg font-bold text-gray-800 line-clamp-1 truncate" title={reportData.topSellingProduct}>
                                    {reportData.topSellingProduct}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Sales Growth %</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {reportData.salesGrowthPercentage}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sales Trend Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 mb-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-indigo-500" />
                            Sales Trend
                        </h2>
                        <div className="w-full h-72 md:h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={reportData.salesTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        tickMargin={10}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                        tickFormatter={(value) => `₹${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value) => [`₹${value}`, 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Product-wise Sales Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <ShoppingCart size={20} className="text-indigo-500" />
                                Product-wise Sales
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm">
                                        <th className="py-4 px-6 font-medium">Product Name</th>
                                        {/* Hide Quantity on very small screens, though it can usually fit. Following request closely: hid minor columns on mobile */}
                                        <th className="py-4 px-6 font-medium hidden md:table-cell">Quantity Sold</th>
                                        <th className="py-4 px-6 font-medium">Revenue Generated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reportData.productWiseSales?.map((product, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-gray-800 font-medium">
                                                {product.productName}
                                                {/* Show quantity on mobile right under product name since it's hidden from table column */}
                                                <div className="md:hidden text-xs text-gray-500 mt-1">
                                                    Qty: {product.totalQuantitySold}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 hidden md:table-cell">
                                                {product.totalQuantitySold}
                                            </td>
                                            <td className="py-4 px-6 text-indigo-600 font-medium whitespace-nowrap">
                                                ₹{product.totalRevenue?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {reportData.productWiseSales?.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="py-8 text-center text-gray-500">
                                                No sales data available for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* INVENTORY REPORT SECTION */}
            <div className="mt-12 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-200 pt-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Inventory Health Reports</h1>
            </div>

            {inventoryError && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl shadow-sm border border-red-100 mb-8">
                    {inventoryError}
                </div>
            )}

            {inventoryData && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                                <p className="text-2xl font-bold text-gray-800">{inventoryData.totalProducts}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Stock Value</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    ₹{inventoryData.totalStockValue?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Low Stock Items</p>
                                <p className="text-2xl font-bold text-gray-800">{inventoryData.lowStockCount}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Safe Stock Items</p>
                                <p className="text-2xl font-bold text-gray-800">{inventoryData.safeStockCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Health Summary Bar */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-indigo-500" />
                            Inventory Health Summary
                        </h2>

                        {(() => {
                            const total = inventoryData.totalProducts || 1; // avoid division by zero
                            const safePct = (inventoryData.safeStockCount / total) * 100;
                            const mediumPct = (inventoryData.mediumStockCount / total) * 100;
                            const lowPct = (inventoryData.lowStockCount / total) * 100;

                            return (
                                <div>
                                    <div className="w-full h-8 flex rounded-lg overflow-hidden mb-3">
                                        <div style={{ width: `${safePct}%` }} className="bg-green-500 transition-all duration-500" title={`Safe: ${inventoryData.safeStockCount}`}></div>
                                        <div style={{ width: `${mediumPct}%` }} className="bg-yellow-400 transition-all duration-500" title={`Medium: ${inventoryData.mediumStockCount}`}></div>
                                        <div style={{ width: `${lowPct}%` }} className="bg-red-500 transition-all duration-500" title={`Low: ${inventoryData.lowStockCount}`}></div>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <div className="flex items-center gap-1 text-green-700">
                                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                            Safe ({safePct.toFixed(1)}%)
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-700">
                                            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                                            Medium ({mediumPct.toFixed(1)}%)
                                        </div>
                                        <div className="flex items-center gap-1 text-red-700">
                                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                            Low ({lowPct.toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Inventory Table with Filter */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Package size={20} className="text-indigo-500" />
                                Inventory Status Details
                            </h2>
                            <div className="w-full sm:w-auto flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Filter Status:</label>
                                <select
                                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-auto bg-white"
                                    value={inventoryFilter}
                                    onChange={(e) => setInventoryFilter(e.target.value)}
                                >
                                    <option value="All">All</option>
                                    <option value="Low">Low Stock</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Safe">Safe</option>
                                </select>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-medium">Product Name</th>
                                        <th className="py-4 px-6 font-medium hidden sm:table-cell">Category</th>
                                        <th className="py-4 px-6 font-medium">Current Stock</th>
                                        <th className="py-4 px-6 font-medium">Stock Value</th>
                                        <th className="py-4 px-6 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {inventoryData.productInventory
                                        ?.filter(item => inventoryFilter === 'All' || item.status === inventoryFilter)
                                        .map((item, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-6 text-gray-800 font-medium whitespace-nowrap">
                                                    {item.productName}
                                                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                                                        {item.category}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-gray-600 hidden sm:table-cell whitespace-nowrap">
                                                    {item.category}
                                                </td>
                                                <td className="py-4 px-6 text-gray-800 font-medium">
                                                    {item.currentStock}
                                                </td>
                                                <td className="py-4 px-6 text-gray-800 font-medium whitespace-nowrap">
                                                    ₹{item.stockValue.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-6 text-center">
                                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center
                                                    ${item.status === 'Low' ? 'bg-red-100 text-red-600' :
                                                            item.status === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                                                                'bg-green-100 text-green-600'}`}
                                                    >
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    {inventoryData.productInventory?.filter(item => inventoryFilter === 'All' || item.status === inventoryFilter).length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-gray-500">
                                                No inventory items match the current filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* FINANCIAL REPORT SECTION */}
            <div className="mt-12 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-200 pt-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Financial Reports</h1>
            </div>

            {/* Financial Filter Panel */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-green-500" />
                    Filter Financial Data
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={financialStartDate}
                            onChange={(e) => setFinancialStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            value={financialEndDate}
                            onChange={(e) => setFinancialEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={handleGenerateFinancialReport}
                            disabled={loadingFinancial}
                            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 font-medium"
                        >
                            {loadingFinancial ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
                {financialError && <p className="text-red-500 mt-2 text-sm">{financialError}</p>}
            </div>

            {financialData && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    ₹{financialData.totalRevenue?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Purchase Cost</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    ₹{financialData.totalPurchaseCost?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${financialData.totalProfit >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Profit</p>
                                <p className={`text-2xl font-bold ${financialData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {financialData.totalProfit >= 0 ? '+' : '-'}₹{Math.abs(financialData.totalProfit)?.toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${financialData.profitMargin >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                <PieChartIcon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Profit Margin %</p>
                                <p className={`text-2xl font-bold ${financialData.profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {financialData.profitMargin}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Trend Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 mb-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-green-500" />
                            Monthly Financial Trend
                        </h2>
                        <div className="w-full h-72 md:h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={financialData.monthlyFinancials} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        formatter={(value, name) => [`₹${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Profit']}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FileText size={20} className="text-green-500" />
                                Financial Summary
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-medium">Month</th>
                                        <th className="py-4 px-6 font-medium">Revenue</th>
                                        <th className="py-4 px-6 font-medium">Purchase Cost</th>
                                        <th className="py-4 px-6 font-medium">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {financialData.monthlyFinancials?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-gray-800 font-medium">
                                                {item.month}
                                            </td>
                                            <td className="py-4 px-6 text-blue-600 font-medium">
                                                ₹{item.revenue?.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-red-500 font-medium">
                                                ₹{item.purchaseCost?.toLocaleString()}
                                            </td>
                                            <td className={`py-4 px-6 font-bold ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {item.profit >= 0 ? '+' : '-'}₹{Math.abs(item.profit)?.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {financialData.monthlyFinancials?.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-gray-500">
                                                No financial data available for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* VENDOR REPORT SECTION */}
            <div className="mt-12 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-200 pt-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vendor Reports</h1>
            </div>

            {/* Vendor Filter Panel */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-purple-500" />
                    Filter Vendor Data
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={vendorStartDate}
                            onChange={(e) => setVendorStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            value={vendorEndDate}
                            onChange={(e) => setVendorEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={handleGenerateVendorReport}
                            disabled={loadingVendor}
                            className="w-full sm:w-auto bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400 font-medium"
                        >
                            {loadingVendor ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
                {vendorError && <p className="text-red-500 mt-2 text-sm">{vendorError}</p>}
            </div>

            {vendorData && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Vendors</p>
                                <p className="text-2xl font-bold text-gray-800">{vendorData.totalVendors}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Award size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Best Vendor</p>
                                <p className="text-lg font-bold text-gray-800 line-clamp-1 truncate" title={vendorData.bestVendor}>
                                    {vendorData.bestVendor}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Top Spender</p>
                                <p className="text-lg font-bold text-gray-800 line-clamp-1 truncate" title={vendorData.highestSpendingVendor}>
                                    {vendorData.highestSpendingVendor}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-lg">
                                <BarChart2 size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Avg Performance</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {vendorData.vendorSummary.length > 0
                                        ? (vendorData.vendorSummary.reduce((acc, curr) => acc + curr.performanceScore, 0) / vendorData.vendorSummary.length).toFixed(1)
                                        : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Performance Chart */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 mb-8">
                        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChart2 size={20} className="text-purple-500" />
                            Vendor Spend vs Performance
                        </h2>
                        <div className="w-full h-72 md:h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={vendorData.vendorSummary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="vendorName" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} />
                                    <YAxis yAxisId="left" orientation="left" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => `₹${value}`} />
                                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => `${value}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    <Bar yAxisId="left" dataKey="totalAmountSpent" name="Total Spent (₹)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="performanceScore" name="Performance Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Vendor Summary Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <Truck size={20} className="text-purple-500" />
                                Vendor Summary
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-medium">Vendor Name</th>
                                        <th className="py-4 px-6 font-medium">Orders</th>
                                        <th className="py-4 px-6 font-medium">Quantity</th>
                                        <th className="py-4 px-6 font-medium">Amount Spent</th>
                                        <th className="py-4 px-6 font-medium hidden sm:table-cell">Avg Delivery Days</th>
                                        <th className="py-4 px-6 font-medium text-center">Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vendorData.vendorSummary?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-gray-800 font-medium">
                                                {item.vendorName}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {item.totalOrders}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {item.totalQuantityOrdered}
                                            </td>
                                            <td className="py-4 px-6 text-purple-600 font-medium">
                                                ₹{item.totalAmountSpent?.toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600 hidden sm:table-cell">
                                                {item.averageDeliveryDays}
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full min-w-[60px] text-center
                                                    ${item.performanceScore > 80 ? 'bg-green-100 text-green-600' :
                                                        item.performanceScore >= 60 ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-red-100 text-red-600'}`}
                                                >
                                                    {item.performanceScore}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {vendorData.vendorSummary?.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-8 text-center text-gray-500">
                                                No vendor data available for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* FORECAST REPORT SECTION */}
            <div className="mt-12 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-200 pt-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Forecast & Demand Reports</h1>
            </div>

            {/* Forecast Filter Panel */}
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Calendar size={20} className="text-orange-500" />
                    Filter Forecast Snapshots
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={forecastStartDate}
                            onChange={(e) => setForecastStartDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto flex-1">
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            value={forecastEndDate}
                            onChange={(e) => setForecastEndDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    <div className="w-full sm:w-auto">
                        <button
                            onClick={handleGenerateForecastReport}
                            disabled={loadingForecast}
                            className="w-full sm:w-auto bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-orange-300 font-medium"
                        >
                            {loadingForecast ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                </div>
                {forecastError && <p className="text-red-500 mt-2 text-sm">{forecastError}</p>}
            </div>

            {forecastData && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Predicted Demand</p>
                                <p className="text-2xl font-bold text-gray-800">{forecastData.totalForecastedDemand?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                <Target size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Average Accuracy %</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {forecastData.averageForecastAccuracy}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Upward Trend Products</p>
                                <p className="text-2xl font-bold text-gray-800">
                                    {forecastData.upwardTrendCount}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${forecastData.forecastSummary.some(f => f.riskStatus === 'Stock Risk') ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Stock Risk Items</p>
                                <p className={`text-2xl font-bold ${forecastData.forecastSummary.some(f => f.riskStatus === 'Stock Risk') ? 'text-red-600' : 'text-gray-800'}`}>
                                    {forecastData.forecastSummary.filter(f => f.riskStatus === 'Stock Risk').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Forecast Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Accuracy Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 lg:col-span-2">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                <Target size={20} className="text-orange-500" />
                                Model Accuracy per Product
                            </h2>
                            <div className="w-full h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={forecastData.forecastSummary.filter(f => f.accuracyPercentage !== null)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="productName" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={{ stroke: '#e5e7eb' }} />
                                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickFormatter={(value) => `${value}%`} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                            formatter={(value) => [`${value}%`, 'Accuracy']}
                                        />
                                        <Bar dataKey="accuracyPercentage" name="Accuracy %" fill="#f97316" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Trend Pie Chart */}
                        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 text-center">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                                <PieChartIcon size={20} className="text-orange-500" />
                                Demand Trend Distribution
                            </h2>
                            <div className="w-full h-64 flex items-center justify-center">
                                {(() => {
                                    const pieData = [
                                        { name: 'Upward', value: forecastData.upwardTrendCount },
                                        { name: 'Downward', value: forecastData.downwardTrendCount },
                                        { name: 'Stable', value: forecastData.forecastSummary.length - (forecastData.upwardTrendCount + forecastData.downwardTrendCount) }
                                    ].filter(d => d.value > 0);

                                    if (pieData.length === 0) return <p className="text-gray-400">No trend data available.</p>;

                                    return (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => {
                                                        const colorIndex = entry.name === 'Upward' ? 0 : entry.name === 'Downward' ? 1 : 2;
                                                        return <Cell key={`cell-${index}`} fill={COLORS[colorIndex]} />;
                                                    })}
                                                </Pie>
                                                <Tooltip formatter={(value) => [value, 'Products']} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Forecast Summary Table */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
                        <div className="p-4 sm:p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                <FileText size={20} className="text-orange-500" />
                                Forecast Breakdown
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                                        <th className="py-4 px-6 font-medium">Product Name</th>
                                        <th className="py-4 px-6 font-medium">Predicted Demand</th>
                                        <th className="py-4 px-6 font-medium">Suggested Reorder</th>
                                        <th className="py-4 px-6 font-medium">Accuracy %</th>
                                        <th className="py-4 px-6 font-medium">Trend</th>
                                        <th className="py-4 px-6 font-medium hidden md:table-cell">Algorithm</th>
                                        <th className="py-4 px-6 font-medium text-center">Risk Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {forecastData.forecastSummary?.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6 text-gray-800 font-medium whitespace-nowrap">
                                                {item.productName}
                                            </td>
                                            <td className="py-4 px-6 text-gray-800 font-bold">
                                                {item.predictedMonthlyDemand}
                                            </td>
                                            <td className="py-4 px-6 text-indigo-600 font-semibold">
                                                {item.suggestedReorder}
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">
                                                {item.accuracyPercentage !== null ? `${item.accuracyPercentage}%` : 'N/A'}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1">
                                                    {item.trendType === 'Upward' && <TrendingUp size={16} className="text-green-500" />}
                                                    {item.trendType === 'Downward' && <TrendingDown size={16} className="text-red-500" />}
                                                    {item.trendType === 'Stable' && <div className="w-4 h-1 bg-gray-400 rounded-full" />}
                                                    <span className={`text-sm ${item.trendType === 'Upward' ? 'text-green-600' :
                                                            item.trendType === 'Downward' ? 'text-red-600' :
                                                                'text-gray-500'
                                                        }`}>
                                                        {item.trendType}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-500 text-sm hidden md:table-cell">
                                                {item.algorithmType}
                                            </td>
                                            <td className="py-3 px-6 text-center">
                                                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] text-center
                                                    ${item.riskStatus === 'Stock Risk' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    {item.riskStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {forecastData.forecastSummary?.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="py-8 text-center text-gray-500">
                                                No forecast data available for this period.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;
