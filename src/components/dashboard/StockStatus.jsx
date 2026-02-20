import React from 'react';
import { useNavigate } from 'react-router-dom';

const StockStatus = ({ lowStockItems }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100/50 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Reorder Alerts</h3>
                <span
                    onClick={() => navigate('/reorder')}
                    className="text-xs font-medium text-blue-600 cursor-pointer hover:underline"
                >
                    View All
                </span>
            </div>
            <div className="p-4">
                {!lowStockItems || lowStockItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No items need reordering</p>
                ) : (
                    <div className="space-y-4">
                        {lowStockItems.map((item) => (
                            <div key={item._id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-red-600 text-sm font-bold" title="Current Quantity">
                                        {item.quantity}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 truncate w-32 sm:w-40">{item.name}</p>
                                        <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                                RL: {item.reorderLevel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/reorder')}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                                >
                                    Order from Vendor
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockStatus;
