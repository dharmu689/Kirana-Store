import React, { useState, useEffect } from 'react';
import vendorOrderService from '../services/vendorOrderService';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const VendorOrders = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await vendorOrderService.getOrders();
            setOrders(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch vendor orders.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await vendorOrderService.updateOrderStatus(id, newStatus);
            fetchOrders(); // Refresh orders after status update
        } catch (err) {
            console.error('Failed to update status:', err);
            alert(err.response?.data?.message || 'Failed to update order status');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending':
                return (
                    <span className="flex items-center text-yellow-600 bg-yellow-100 rounded-full px-3 py-1 font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Pending
                    </span>
                );
            case 'Approved':
                return (
                    <span className="flex items-center text-blue-600 bg-blue-100 rounded-full px-3 py-1 font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Approved
                    </span>
                );
            case 'Delivered':
                return (
                    <span className="flex items-center text-green-600 bg-green-100 rounded-full px-3 py-1 font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Delivered
                    </span>
                );
            default:
                return status;
        }
    };

    if (!isAdmin) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">You do not have permission to view vendor orders.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {t.vendorOrders || "Vendor Orders"}
                    </h2>
                    <button
                        onClick={fetchOrders}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        {t.product || "Product"}
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        {t.vendor || "Vendor"}
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        {t.quantity || "Quantity"}
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Order Date
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order._id}>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
                                                <p className="text-gray-900 dark:text-gray-100 whitespace-no-wrap font-medium">
                                                    {order.product?.name || 'Unknown Product'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900 dark:text-gray-100 font-medium">{order.vendor?.name || 'Unknown Vendor'}</span>
                                                    <span className="text-gray-500 text-xs">{order.vendor?.contactPerson}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center">
                                                <p className="text-gray-900 dark:text-gray-100 whitespace-no-wrap font-bold">
                                                    {order.quantity}
                                                </p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
                                                <p className="text-gray-900 dark:text-gray-100 whitespace-no-wrap">
                                                    {new Date(order.orderDate).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
                                                {getStatusIcon(order.status)}
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
                                                {order.status !== 'Delivered' && (
                                                    <select
                                                        className="block w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-1 px-2 rounded leading-tight focus:outline-none focus:bg-white dark:bg-gray-900 focus:border-gray-500 text-sm"
                                                        value=""
                                                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    >
                                                        <option value="" disabled>Update Status</option>
                                                        {order.status === 'Pending' && <option value="Approved">Mark Approved</option>}
                                                        <option value="Delivered">Mark Delivered</option>
                                                    </select>
                                                )}
                                                {order.status === 'Delivered' && (
                                                    <span className="text-gray-500 text-xs italic">Completed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-center text-gray-500">
                                            No vendor orders found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrders;
