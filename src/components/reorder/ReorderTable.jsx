import React from 'react';

const ReorderTable = ({ alerts }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <h2 className="text-xl font-semibold p-4 border-b text-gray-800">Products Needing Attention</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6">Product</th>
                            <th className="py-3 px-6">Category</th>
                            <th className="py-3 px-6 text-center">Current Stock</th>
                            <th className="py-3 px-6 text-center">Reorder Point</th>
                            <th className="py-3 px-6 text-center text-blue-600">Suggested Order</th>
                            <th className="py-3 px-6 text-center">Status</th>
                            <th className="py-3 px-6 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {alerts && alerts.length > 0 ? (
                            alerts.map((item) => (
                                <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-150">
                                    <td className="py-3 px-6 font-medium text-gray-800">
                                        {item.name}
                                    </td>
                                    <td className="py-3 px-6">
                                        <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-xs">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center font-bold">
                                        {item.quantity}
                                    </td>
                                    <td className="py-3 px-6 text-center text-gray-500">
                                        {item.reorderPoint}
                                    </td>
                                    <td className="py-3 px-6 text-center font-bold text-blue-600 bg-blue-50 rounded-lg">
                                        {item.suggestedOrderQty}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <span className={`py-1 px-3 rounded-full text-xs font-bold ${item.status === 'CRITICAL'
                                                ? 'bg-red-100 text-red-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700 transition duration-200 text-xs shadow-sm"
                                            onClick={() => alert(`Order placed for ${item.suggestedOrderQty} units of ${item.name} (Simulated)`)}
                                        >
                                            Order Now
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                    No reorder alerts. Your inventory is healthy!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReorderTable;
