import React, { useState, useEffect } from 'react';
import API from '../utils/axiosConfig';
import ForecastChart from '../components/ForecastChart';
import SeasonalityChart from '../components/SeasonalityChart';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const Forecasting = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [forecastData, setForecastData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [sortBy, setSortBy] = useState('demand'); // 'demand' or 'reorder'

    // Chart States
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [weeklyDistribution, setWeeklyDistribution] = useState([]);
    const [chartLoading, setChartLoading] = useState(false);

    const [algorithm, setAlgorithm] = useState('regression'); // Default to Linear Regression

    // Fetch saved forecasts on load
    useEffect(() => {
        fetchData();
    }, [algorithm]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get(`/forecast?type=${algorithm}`);
            setForecastData(response.data);
        } catch (err) {
            console.error('Error fetching forecast:', err);
            setError(err.response?.data?.message || 'Failed to load forecast data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setSuccessMsg('');
        setSelectedProduct(null);
        try {
            const response = await API.post(`/forecast/generate?type=${algorithm}`);
            setForecastData(response.data);
            setSuccessMsg('Forecast generated successfully! Added to history.');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error generating forecast:', err);
            setError(err.response?.data?.message || 'Failed to generate forecast.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!window.confirm("This will wipe all forecast history and recalculate. Are you sure?")) return;
        setLoading(true);
        setError('');
        setSuccessMsg('');
        setSelectedProduct(null);
        try {
            const response = await API.put(`/forecast/regenerate?type=${algorithm}`);
            setForecastData(response.data);
            setSuccessMsg('Forecast history wiped and regenerated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Error regenerating forecast:', err);
            setError(err.response?.data?.message || 'Failed to regenerate forecast.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluateAll = async () => {
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            await API.post('/forecast/evaluate-all');
            setSuccessMsg('Global accuracy evaluated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);
            fetchData();
        } catch (err) {
            console.error('Error evaluating forecasts:', err);
            setError(err.response?.data?.message || 'Failed to evaluate forecasts.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluateSingle = async (e, id) => {
        e.stopPropagation(); // Prevent row click
        setLoading(true);
        setError('');
        try {
            await API.put(`/forecast/${id}/evaluate`);
            fetchData(); // Refresh row layout
        } catch (err) {
            console.error('Error evaluating forecast row:', err);
            setError(err.response?.data?.message || 'Failed to evaluate tracking item.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTrendData = async (productId, productName) => {
        if (!productId) return;
        setChartLoading(true);
        setSelectedProduct(productName);
        try {
            const response = await API.get(`/forecast/${productId}/trend`);
            setTrendData(response.data.trendData || response.data);
            setWeeklyDistribution(response.data.weeklyDistribution || []);
        } catch (err) {
            console.error('Error fetching trend data:', err);
        } finally {
            setChartLoading(false);
        }
    };

    // Sort Data
    const sortedData = [...forecastData].sort((a, b) => {
        if (sortBy === 'demand') {
            return b.predictedMonthlyDemand - a.predictedMonthlyDemand;
        } else {
            return b.suggestedReorder - a.suggestedReorder;
        }
    });

    const latestDate = forecastData.length > 0 ? forecastData[0].generatedAt : null;
    const latestBatch = latestDate ? forecastData.filter(item => item.generatedAt === latestDate) : [];

    // Trend Tracking KPIS 
    const upwardTrends = latestBatch.filter(item => item.trendType === 'Upward').length;
    const downwardTrends = latestBatch.filter(item => item.trendType === 'Downward').length;

    // Determine Universal Peak Day across batch
    const allPeakDays = latestBatch.filter(item => item.seasonalPeakDay !== 'None').map(item => item.seasonalPeakDay);
    let mostCommonPeak = 'None';

    if (allPeakDays.length > 0) {
        const counts = {};
        let maxCount = 0;
        allPeakDays.forEach(day => {
            counts[day] = (counts[day] || 0) + 1;
            if (counts[day] > maxCount) {
                maxCount = counts[day];
                mostCommonPeak = day;
            }
        });
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">{t?.demandForecast || "Demand Forecasting"}</h1>
                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 items-center">
                    <select
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg shadow-sm bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium"
                    >
                        <option value="moving_average">Moving Average (Baseline)</option>
                        <option value="regression">Linear Regression (AI)</option>
                        <option value="hybrid">Hybrid AI (Blended)</option>
                    </select>
                    <button
                        onClick={handleEvaluateAll}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50"
                    >
                        Evaluate All (Accuracy)
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                        {loading ? 'Working...' : 'Generate Forecast'}
                    </button>
                    <button
                        onClick={handleRegenerate}
                        disabled={loading}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50"
                    >
                        Regenerate (Wipe)
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg border border-red-200 shadow-sm animate-fade-in">
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 shadow-sm animate-fade-in">
                    {successMsg}
                </div>
            )}

            {/* Content Area */}
            {forecastData.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-12 text-center border border-gray-100">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">No Forecast Data</h3>
                    <p className="text-gray-500">Generate your first AI-driven demand prediction based on recent sales history.</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-l-4 border-emerald-500 hover:shadow-xl transition-shadow">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center">
                                <svg className="w-4 h-4 mr-1 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Upward Trend SKU's
                            </h3>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{upwardTrends}</p>
                            <p className="text-xs text-emerald-600 font-medium mt-1">Growth detected</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-l-4 border-rose-500 hover:shadow-xl transition-shadow">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center">
                                <svg className="w-4 h-4 mr-1 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                </svg>
                                Products At Risk
                            </h3>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{downwardTrends}</p>
                            <p className="text-xs text-rose-600 font-medium mt-1">Declining demand detected</p>
                        </div>

                        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 hover:shadow-xl transition-shadow">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide flex items-center">
                                <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Universal Peak Day
                            </h3>
                            <p className="text-3xl font-bold text-gray-800 dark:text-gray-200 mt-2">{mostCommonPeak}</p>
                            <p className="text-xs text-indigo-600 font-medium mt-1">Highest store volume period</p>
                        </div>
                    </div>

                    {algorithm === 'hybrid' && (
                        <div className="mb-8 bg-gradient-to-r from-orange-50 to-indigo-50 border border-orange-100 rounded-xl p-6 shadow-sm flex items-center gap-4 animate-fade-in">
                            <div className="p-3 bg-white dark:bg-gray-900 rounded-full shadow-sm text-orange-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Hybrid AI Matrix Active</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                                    <span className="text-orange-600 font-bold">Hybrid Forecast</span> = Moving Average (40%) + Linear Regression (50%) + Seasonal Factor (10%)
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Algorithmic weights autonomously self-correct increasing Regression priority identically balancing if trailing historic accuracy slips beneath 70% thresholds.</p>
                            </div>
                        </div>
                    )}

                    {/* Dynamic Chart Containers (Side by Side when available) */}
                    {selectedProduct && (
                        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    30-Day Trend: {selectedProduct}
                                </h2>
                                <div className="flex-1 min-h-[250px]">
                                    <ForecastChart data={trendData} loading={chartLoading} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 p-6 flex flex-col">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                                    <svg className="w-5 h-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Seasonal Weekday Distribution
                                </h2>
                                <div className="flex-1 min-h-[250px]">
                                    <SeasonalityChart data={weeklyDistribution} loading={chartLoading} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Controls & Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Forecast History Tracking <span className="text-xs font-normal text-gray-500 ml-2">(Click row to view trend/seasonality)</span></h2>
                            <div className="flex items-center gap-2">
                                <label className="text-sm text-gray-600 dark:text-gray-400 font-medium whitespace-nowrap">Sort By:</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                                >
                                    <option value="demand">Highest Demand</option>
                                    <option value="reorder">Highest Reorder</option>
                                </select>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{t.product || "Product"}</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">{t.trend || "Trend"}</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">Peak Day</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Predicted/Mo</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50/50">Suggested Reorder</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Accuracy %</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100">
                                    {sortedData.map((item) => (
                                        <tr
                                            key={item._id}
                                            onClick={() => fetchTrendData(item.product?._id, item.product?.name)}
                                            className="hover:bg-indigo-50 transition-colors cursor-pointer group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">
                                                    {item.product?.name || 'Unknown Product'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                                                <div className="flex items-center">
                                                    {item.trendType === 'Upward' && (
                                                        <svg className="w-5 h-5 text-emerald-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                    )}
                                                    {item.trendType === 'Downward' && (
                                                        <svg className="w-5 h-5 text-rose-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                                                    )}
                                                    {item.trendType === 'Stable' && (
                                                        <svg className="w-5 h-5 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14" /></svg>
                                                    )}
                                                    <span className={`text-sm font-semibold ${item.trendType === 'Upward' ? 'text-emerald-600' :
                                                        item.trendType === 'Downward' ? 'text-rose-600' :
                                                            'text-gray-500'
                                                        }`}>
                                                        {item.trendType} {item.trendStrength > 0 ? `(${item.trendStrength}%)` : ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                                                {item.seasonalPeakDay !== 'None' ? (
                                                    <span className="px-2 py-1 text-xs font-semibold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center w-fit">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                        {item.seasonalPeakDay}
                                                    </span>
                                                ) : <span className="text-sm text-gray-400">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.predictedMonthlyDemand}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap bg-indigo-50/10 group-hover:bg-indigo-100/30 transition-colors">
                                                <div className={`text-sm font-bold ${item.suggestedReorder > 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                    {item.suggestedReorder > 0 ? `+${item.suggestedReorder}` : '0'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.accuracyPercentage !== null ? (
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${item.accuracyPercentage >= 85 ? 'bg-green-100 text-green-800 border-green-200' :
                                                        item.accuracyPercentage >= 70 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                            'bg-red-100 text-red-800 border-red-200'
                                                        }`}>
                                                        {item.accuracyPercentage}%
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                                                        Unrated
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={(e) => handleEvaluateSingle(e, item._id)}
                                                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                                >
                                                    Evaluate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Forecasting;
