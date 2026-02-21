import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import vendorService from '../services/vendorService';
import { ArrowLeft, Star, Clock, DollarSign, TrendingUp } from 'lucide-react';

const VendorCompare = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBestVendors = async () => {
            try {
                setLoading(true);
                const data = await vendorService.getBestVendorsForProduct(productId);
                setVendors(data);
                setError('');
            } catch (err) {
                console.error("Error fetching vendor comparisons", err);
                setError(err.response?.data?.message || 'Failed to initialize vendor algorithms.');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchBestVendors();
        }
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
                <h2 className="text-xl font-bold text-gray-700">Calculating Optimization Matrix...</h2>
                <p className="text-gray-500 mt-2">Running supplier logistic algorithms.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </button>
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 shadow-sm text-center">
                    <h3 className="text-xl font-bold mb-2">Algorithm Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const topVendor = vendors.length > 0 ? vendors[0] : null;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reorder
                </button>

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="w-8 h-8 text-indigo-600 mr-3" />
                    Vendor Optimization Analysis
                </h1>
                <p className="mt-2 text-gray-600">Smart comparison parsing supplier pricing vs delivery speeds organically returning the best ROI trajectory.</p>
            </div>

            {/* Top Recommended Vendor Hero Card */}
            {topVendor && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-1 shadow-lg mb-8 animate-fade-in">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-white">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-white text-indigo-600 rounded-full p-4 mr-6 shadow-inner hidden md:block">
                                <Star fill="currentColor" className="w-10 h-10" />
                            </div>
                            <div>
                                <div className="text-indigo-100 text-sm font-bold uppercase tracking-wider mb-1 flex items-center">
                                    <span className="flex h-2 w-2 relative mr-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-200 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                    </span>
                                    AI Recommended Vendor
                                </div>
                                <h2 className="text-3xl font-black">{topVendor.name}</h2>
                                <p className="text-indigo-100 mt-2 text-sm md:text-base opacity-90">
                                    Scored the highest combining low cost and rapid delivery times intelligently bounding 100 max parameters securely.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/20 rounded-xl p-4 flex flex-col items-center min-w-[140px] border border-white/30">
                            <span className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Optimizer Score</span>
                            <span className="text-4xl font-black">{topVendor.optimizationMetrics?.finalScore}</span>
                            <span className="text-xs mt-1 opacity-80">out of 100</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Complete Supplier Matrix</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Supplier
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Unit Price
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Delivery Days
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50/30">
                                    Final Score
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {vendors.map((vendor, index) => (
                                <tr
                                    key={vendor._id}
                                    className={`${index === 0 ? 'bg-indigo-50/50 hover:bg-indigo-50 transition-colors' : 'hover:bg-gray-50 transition-colors'}`}
                                >
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {index === 0 && (
                                                <div className="bg-indigo-600 text-white rounded-full p-1 mr-3 flex-shrink-0">
                                                    <Star className="w-3 h-3" fill="currentColor" />
                                                </div>
                                            )}
                                            {index !== 0 && (
                                                <div className="w-5 mr-3"></div> // Spacer
                                            )}
                                            <div className="ml-0">
                                                <div className={`text-sm font-bold ${index === 0 ? 'text-indigo-900' : 'text-gray-900'}`}>{vendor.name}</div>
                                                <div className="text-xs text-gray-500">{vendor.email}</div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center text-sm font-medium text-gray-900">
                                            <DollarSign className={`w-4 h-4 mr-1 ${index === 0 ? 'text-green-600' : 'text-gray-400'}`} />
                                            {vendor.pricePerUnit?.toFixed(2) || 'N/A'}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Score: <span className="font-semibold text-gray-600">{vendor.optimizationMetrics?.priceScore}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center text-sm font-medium text-gray-900">
                                            <Clock className={`w-4 h-4 mr-1 ${index === 0 ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            {vendor.averageDeliveryDays || 'N/A'} Days
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Score: <span className="font-semibold text-gray-600">{vendor.optimizationMetrics?.deliveryScore}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-center">
                                        <div className="flex justify-center">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < (vendor.vendorRating || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                                                    fill="currentColor"
                                                />
                                            ))}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            Score: <span className="font-semibold text-gray-600">{vendor.optimizationMetrics?.ratingScore}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-center bg-indigo-50/10">
                                        <div className={`text-lg font-black ${index === 0 ? 'text-indigo-600' : 'text-gray-700'}`}>
                                            {vendor.optimizationMetrics?.finalScore}
                                        </div>
                                        {index === 0 && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                                                Best Match
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorCompare;
