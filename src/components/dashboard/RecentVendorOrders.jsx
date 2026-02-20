import React from 'react';
import { Package } from 'lucide-react';

const RecentVendorOrders = ({ orders }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden h-full">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Recent Vendor Orders</h3>
            </div>
            <div className="p-4">
                {!orders || orders.length === 0 ? (
                    <div className="text-center py-6">
                        <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No recent vendor orders</p>
                        <p className="text-xs text-gray-400 mt-1">Orders you place will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                                            order.status === 'Approved' ? 'bg-blue-100 text-blue-600' :
                                                'bg-yellow-100 text-yellow-600'}`
                                    }>
                                        <Package size={18} />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900">
                                            {order.product?.name || 'Unknown Product'}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            <span className="text-xs text-gray-500">
                                                Qty: {order.quantity} • Vendor: {order.vendor?.name?.split(' ')[0] || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {new Date(order.orderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </p>
                                    <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium
                                        ${order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                                            order.status === 'Approved' ? 'bg-blue-50 text-blue-700' :
                                                'bg-yellow-50 text-yellow-700'}`
                                    }>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentVendorOrders;
