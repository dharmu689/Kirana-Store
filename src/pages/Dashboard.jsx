import React, { useEffect, useState, useCallback } from 'react';
import KPICards from '../components/dashboard/KPICards';
import dashboardService from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowRight, Activity, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { motion } from 'framer-motion';
import AIChatAssistant from '../components/AIChatAssistant';
import productService from '../services/productService';
import VendorOrderModal from '../components/VendorOrderModal';
import vendorOrderService from '../services/vendorOrderService';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [profitData, setProfitData] = useState({
    totalProfit: 0,
    oneDayProfit: 0,
    sevenDaysProfit: 0,
    thirtyDaysProfit: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [lowSellingProducts, setLowSellingProducts] = useState([]);
  const [profitChartData, setProfitChartData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("1day");
  const [loading, setLoading] = useState(true);

  // Reorder Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedReorderProduct, setSelectedReorderProduct] = useState(null);

  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = translations[language];

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getSummary();
      setSummaryData(data);

      const pData = await dashboardService.getDashboardProfit();
      setProfitData(pData);

      const topProd = await dashboardService.getTopProducts();
      setTopProducts(topProd);

      const lowProd = await dashboardService.getLowSellingProducts();
      setLowSellingProducts(lowProd);

      const chartData = await dashboardService.getProfitChartData(selectedPeriod);
      setProfitChartData(chartData);

      const lstProducts = await productService.getLowStockProducts();
      setLowStockProducts(lstProducts);
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

  useEffect(() => {
    const fetchChartForPeriod = async () => {
      try {
        const data = await dashboardService.getProfitChartData(selectedPeriod);
        setProfitChartData(data);
      } catch (error) {
        console.error("Failed to fetch profit chart data", error);
      }
    };
    // Don't fetch on initial mount if fetchAllData already covers it, but it's simpler to just fetch it
    fetchChartForPeriod();
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-transparent">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-brand-blue)] mb-4"></div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">{t?.loading || "Loading Dashboard..."}</h2>
        <p className="text-sm text-gray-500 mt-2">{t?.aggregatingData || "Aggregating Summary Data"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            <Activity className="w-6 h-6 mr-3 text-[var(--color-brand-blue)] dark:text-[var(--color-brand-blue-hover)]" />
            {t.dashboard || "Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{t?.systemOverview || "Complete System Overview"}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => navigate('/forecasting')}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[var(--color-brand-orange)] dark:text-[var(--color-brand-orange)] font-bold rounded-lg text-sm shadow-sm hover-mac-folder flex items-center"
          >
            <TrendingUp className="w-4 h-4 mr-2" /> {t.forecasting || "View Forecasts"}
          </button>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-[var(--color-brand-blue)] text-white font-bold rounded-lg text-sm shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 hover-mac-folder flex items-center hover:bg-[var(--color-brand-blue-hover)]"
          >
            {t.products || "Products"} <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Row 1 - KPI Cards */}
      <KPICards data={summaryData} />

      {/* Profit Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Profit Switch Section */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-indigo-600/10 
                        dark:from-blue-900/30 dark:to-indigo-800/30
                        backdrop-blur-xl p-6 rounded-2xl shadow-xl 
                        border border-blue-200/40 dark:border-blue-700/40 
                        hover:shadow-blue-500/30 transition-all duration-300"
        >

          <h3 className="text-gray-700 dark:text-gray-300 font-semibold mb-4 tracking-wide">
            📊 Profit Overview
          </h3>

          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => setSelectedPeriod("1day")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300
                    ${selectedPeriod === "1day"
                  ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-gray-700"
                }`}
            >
              1 Day
            </button>
            <button
              onClick={() => setSelectedPeriod("1week")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300
                    ${selectedPeriod === "1week"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-gray-700"
                }`}
            >
              1 Week
            </button>
            <button
              onClick={() => setSelectedPeriod("1year")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300
                    ${selectedPeriod === "1year"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700"
                }`}
            >
              1 Year
            </button>
            <button
              onClick={() => setSelectedPeriod("total")}
              className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300
                    ${selectedPeriod === "total"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
                }`}
            >
              Total Profit
            </button>
          </div>

          <motion.p
            key={selectedPeriod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-black text-green-500 dark:text-green-400"
          >
            ₹{
              (selectedPeriod === "total"
                ? profitData?.totalProfit
                : selectedPeriod === "1year"
                  ? profitChartData.reduce((sum, item) => sum + (item.profit || 0), 0)
                  : selectedPeriod === "1week"
                    ? profitData?.sevenDaysProfit
                    : profitData?.oneDayProfit
              )?.toLocaleString() || 0
            }
          </motion.p>

          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
        </motion.div>

      </div>

      {/* Row 2 - Sales & Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="w-full h-80 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover-mac-folder transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{t?.salesTrend || "Sales Trend (30 Days)"}</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summaryData?.salesTrend || []} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(str) => str?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Line type="monotone" dataKey="sales" stroke="var(--color-brand-blue)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Profit Chart */}
        <div className="w-full h-80 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover-mac-folder transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Profit Overview Chart ({selectedPeriod === '1day' ? '1 Day' : selectedPeriod === '1week' ? '1 Week' : selectedPeriod === '1year' ? '1 Year' : 'All Time'})</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={profitChartData || []} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 - Product Analytics Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

        {/* Top Selling Products */}
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover-mac-folder transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
            ⭐ Top Selling Products
          </h3>
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-brand-blue)]/10 text-[var(--color-brand-blue)] font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[var(--color-brand-blue)]">{product.totalSold} sales</div>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">No sales data available yet.</p>
            )}
          </div>
        </div>

        {/* Low Selling Products */}
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50 hover-mac-folder transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center text-orange-500">
            ⚠️ Low Selling Products
          </h3>
          <div className="space-y-4">
            {lowSellingProducts.length > 0 ? lowSellingProducts.map((product) => {
              const daysAgo = product.lastSoldDate
                ? Math.floor((new Date() - new Date(product.lastSoldDate)) / (1000 * 60 * 60 * 24))
                : 'N/A';

              return (
                <div key={product._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-orange-500">Last sold {daysAgo} days ago</div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-sm">All products are selling well!</p>
            )}
          </div>
        </div>

      </div>

      {/* Row 4 - Low Stock Reorder Section */}
      <div className="grid grid-cols-1 gap-6 pb-6">
        <div className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-red-100/50 dark:border-red-900/50 hover-mac-folder transition-all duration-300">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center text-red-500">
            ⚠️ Low Stock Products
          </h3>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => (
              <div key={product._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50 gap-3">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    <span className="text-red-500 mr-2">⚠</span>
                    {product.name}
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
                    Stock: {product.quantity}
                  </span>
                </div>
                <div className="text-right w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedReorderProduct(product);
                      setIsOrderModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center"
                  >
                    Order From Vendor
                  </button>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-sm">All products are adequately stocked.</p>
            )}
          </div>
        </div>
      </div>

      <VendorOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setSelectedReorderProduct(null);
        }}
        product={selectedReorderProduct}
        onPlaceOrder={async (orderData) => {
          try {
            // Dashboard typically might use placeOrder or createOrder - map to placeOrder for consistency to hit backend securely
            await vendorOrderService.placeOrder(orderData);
            toast.success('Vendor Order Placed Successfully');
            setIsOrderModalOpen(false);
            setSelectedReorderProduct(null);
            // Refresh dashboard data so low-stock lists get theoretically refreshed immediately
            fetchAllData();
          } catch (err) {
            console.error('Order Error:', err);
            const msg = err.response?.data?.message || err.message || 'Failed to place order';
            toast.error(msg);
            throw err;
          }
        }}
      />

      {/* Floating AI Chat Assistant */}
      <AIChatAssistant />
    </div>
  );
};

export default Dashboard;