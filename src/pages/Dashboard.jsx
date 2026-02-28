// import React, { useEffect, useState, useCallback } from 'react';
// import KPICards from '../components/dashboard/KPICards';
// import dashboardService from '../services/dashboardService';
// import { useNavigate } from 'react-router-dom';
// import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
// import { ArrowRight, Activity, TrendingUp } from 'lucide-react';
// import { useLanguage } from '../context/LanguageContext';
// import { translations } from '../utils/translations';
// import { motion } from 'framer-motion';

// const Dashboard = () => {
//     const [summaryData, setSummaryData] = useState(null);
//     const [profitData, setProfitData] = useState({
//         totalProfit: 0,
//         oneDayProfit: 0,
//         thirtyDaysProfit: 0
//     });
//     const [selectedPeriod, setSelectedPeriod] = useState("1day");
//     const [loading, setLoading] = useState(true);
//     const navigate = useNavigate();
//     const { language } = useLanguage();
//     const t = translations[language];

//     const fetchAllData = useCallback(async () => {
//         try {
//             setLoading(true);
//             const data = await dashboardService.getSummary();
//             setSummaryData(data);

//             const pData = await dashboardService.getDashboardProfit();
//             setProfitData(pData);
//         } catch (error) {
//             console.error("Failed to fetch dashboard summary", error);
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchAllData();

//         const onFocus = () => {
//             fetchAllData();
//         };

//         window.addEventListener('focus', onFocus);
//         return () => window.removeEventListener('focus', onFocus);
//     }, [fetchAllData]);

//     if (loading) {
//         return (
//             <div className="flex flex-col justify-center items-center h-screen bg-transparent">
//                 <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-brand-blue)] mb-4"></div>
//                 <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">{t?.loading || "Loading Dashboard..."}</h2>
//                 <p className="text-sm text-gray-500 mt-2">{t?.aggregatingData || "Aggregating Summary Data"}</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Page Header */}
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
//                 <div>
//                     <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
//                         <Activity className="w-6 h-6 mr-3 text-[var(--color-brand-blue)] dark:text-[var(--color-brand-blue-hover)]" />
//                         {t.dashboard || "Dashboard"}
//                     </h1>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">{t?.systemOverview || "Complete System Overview"}</p>
//                 </div>
//                 <div className="mt-4 sm:mt-0 flex space-x-3">
//                     <button
//                         onClick={() => navigate('/forecasting')}
//                         className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[var(--color-brand-orange)] dark:text-[var(--color-brand-orange)] font-bold rounded-lg text-sm shadow-sm hover-mac-folder flex items-center"
//                     >
//                         <TrendingUp className="w-4 h-4 mr-2" /> {t.forecasting || "View Forecasts"}
//                     </button>
//                     <button
//                         onClick={() => navigate('/products')}
//                         className="px-4 py-2 bg-[var(--color-brand-blue)] text-white font-bold rounded-lg text-sm shadow-lg shadow-blue-500/30 dark:shadow-blue-900/30 hover-mac-folder flex items-center hover:bg-[var(--color-brand-blue-hover)]"
//                     >
//                         {t.products || "Products"} <ArrowRight className="w-4 h-4 ml-2" />
//                     </button>
//                 </div>
//             </div>

//             {/* Row 1 - KPI Cards */}
//             <KPICards data={summaryData} />

//             {/* Profit Analytics Row */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//                 {/* Total Profit Card */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6 }}
//                     className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800"
//                 >
//                     <h3 className="text-gray-600 dark:text-gray-300 font-medium">
//                         Total Profit
//                     </h3>
//                     {loading ? (
//                         <p className="text-gray-500 mt-2">Loading...</p>
//                     ) : (
//                         <p className="text-3xl font-bold text-green-600 mt-2">
//                             ₹{profitData?.totalProfit?.toLocaleString()}
//                         </p>
//                     )}
//                 </motion.div>

//                 {/* Profit Switch Section */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 30 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.8 }}
//                     className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800"
//                 >
//                     <div className="flex gap-4 mb-4">
//                         <button
//                             onClick={() => setSelectedPeriod("1day")}
//                             className={`px-4 py-2 rounded font-medium transition-colors ${selectedPeriod === '1day' ? 'bg-[var(--color-brand-blue)] text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
//                         >
//                             1 Day
//                         </button>
//                         <button
//                             onClick={() => setSelectedPeriod("30days")}
//                             className={`px-4 py-2 rounded font-medium transition-colors ${selectedPeriod === '30days' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
//                         >
//                             30 Days
//                         </button>
//                     </div>
//                     {!loading && (
//                         <motion.p
//                             key={selectedPeriod}
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ duration: 0.5 }}
//                             className="text-2xl font-bold text-green-500"
//                         >
//                             ₹{
//                                 (selectedPeriod === "1day"
//                                     ? profitData?.oneDayProfit
//                                     : profitData?.thirtyDaysProfit)?.toLocaleString()
//                             }
//                         </motion.p>
//                     )}
//                 </motion.div>
//             </div>

//             {/* Row 2 - Sales Trend Chart */}
//             <div className="w-full h-80 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-gray-100/50 dark:border-gray-700/50">
//                 <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">{t?.salesTrend || "Sales Trend (30 Days)"}</h3>
//                 <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={summaryData?.salesTrend || []} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
//                         <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(str) => str?.slice(5) || ''} />
//                         <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
//                         <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
//                         <Line type="monotone" dataKey="sales" stroke="var(--color-brand-blue)" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
//                     </LineChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };

// export default Dashboard;


{/* Profit Analytics Row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

  {/* Total Profit Card */}
  <motion.div
    whileHover={{ scale: 1.03 }}
    transition={{ type: "spring", stiffness: 200 }}
    className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-600/10 
               dark:from-green-900/30 dark:to-emerald-800/30
               backdrop-blur-xl p-6 rounded-2xl shadow-xl 
               border border-green-200/40 dark:border-green-700/40 
               hover:shadow-green-500/30 transition-all duration-300"
  >

    <h3 className="text-gray-700 dark:text-gray-300 font-semibold tracking-wide">
      💰 Total Profit
    </h3>

    <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-3">
      ₹{profitData?.totalProfit?.toLocaleString()}
    </p>

    <div className="absolute top-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-2xl"></div>
  </motion.div>


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

    <div className="flex gap-3 mb-6">

      <button
        onClick={() => setSelectedPeriod("1day")}
        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300
        ${selectedPeriod === "1day"
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700"
        }`}
      >
        1 Day
      </button>

      <button
        onClick={() => setSelectedPeriod("30days")}
        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300
        ${selectedPeriod === "30days"
          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-gray-700"
        }`}
      >
        30 Days
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
        (selectedPeriod === "1day"
          ? profitData?.oneDayProfit
          : profitData?.thirtyDaysProfit
        )?.toLocaleString()
      }
    </motion.p>

    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl"></div>
  </motion.div>

</div>