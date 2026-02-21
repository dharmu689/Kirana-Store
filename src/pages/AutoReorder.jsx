import React, { useState, useEffect } from 'react';
import API from '../utils/axiosConfig';
import { ShoppingCart, AlertTriangle, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const AutoReorder = () => {
    const [reorderData, setReorderData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get('/forecast/auto-reorder');
            setReorderData(response.data);
        } catch (err) {
            console.error('Error fetching auto reorder data:', err);
            setError(err.response?.data?.message || 'Failed to load smart reorder limits.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (productId) => {
        try {
            await API.put(`/forecast/auto-reorder/toggle/${productId}`);
            setSuccessMsg('Auto-Reorder configuration updated successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
            // Instantly sync frontend arrays cleanly
            fetchData();
        } catch (err) {
            console.error('Error toggling auto reorder:', err);
            setError('Failed to toggle auto reorder settings.');
        }
    };

    // Calculate Dashboard KPIs
    const highRiskCount = reorderData.filter(item => item.riskLevel === 'High').length;
    const autoReordersTriggered = reorderData.filter(item => item.riskLevel === 'High' && item.autoReorderEnabled).length;
    const upcomingAlerts = reorderData.filter(item => item.riskLevel === 'Medium').length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                    <TrendingUp className="mr-3 text-indigo-600" size={32} />
                    Auto-Reorder System
                </h1>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-colors"
                >
                    {loading ? 'Syncing...' : 'Refresh Algorithm'}
                </button>
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

            {/* Smart KPI Integration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">High Risk Products</p>
                        <h2 className="text-3xl font-bold text-gray-800">{highRiskCount}</h2>
                        <p className="text-xs text-red-600 font-semibold mt-1">Stock depleted below safe margins</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full">
                        <AlertTriangle className="text-red-500" size={28} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Auto Reorders Triggered</p>
                        <h2 className="text-3xl font-bold text-gray-800">{autoReordersTriggered}</h2>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">Silent vendor orders active</p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-full">
                        <CheckCircle className="text-emerald-500" size={28} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Upcoming Alerts</p>
                        <h2 className="text-3xl font-bold text-gray-800">{upcomingAlerts}</h2>
                        <p className="text-xs text-amber-600 font-semibold mt-1">Stock approaching reorder point</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-full">
                        <Package className="text-amber-500" size={28} />
                    </div>
                </div>
            </div>

            {/* Reorder Dynamic Board */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Supply Chain Predictive Tracking</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Stock</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reorder Point</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pred. Demand/Mo</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-600 uppercase tracking-wider bg-indigo-50">Suggest Order</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Level</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Auto Enable</th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {reorderData.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                                        No tracking data available. Ensure forecasts are generated first.
                                    </td>
                                </tr>
                            ) : (
                                reorderData.map((item) => (
                                    <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.productName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-bold ${item.currentStock < item.reorderPoint ? 'text-red-500' : 'text-gray-700'}`}>
                                                {item.currentStock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {item.reorderPoint}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.predictedMonthlyDemand}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-700 bg-indigo-50/30">
                                            +{item.suggestedOrder}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${item.riskLevel === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                                    item.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                        'bg-green-100 text-green-800 border-green-200'
                                                }`}>
                                                {item.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleToggle(item.productId)}
                                                className={`relative inline-flex items-center h-6 rounded-full w-11 hover:opacity-80 transition-opacity ${item.autoReorderEnabled ? 'bg-indigo-600' : 'bg-gray-300'}`}
                                            >
                                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${item.autoReorderEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <Link
                                                to="/vendor-orders"
                                                className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors inline-block"
                                            >
                                                Create Vendor Order
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AutoReorder;
