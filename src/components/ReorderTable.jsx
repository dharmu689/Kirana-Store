import React from 'react';

const ReorderTable = ({ products, onRestock }) => {
    // Get user role from localStorage
    // In a real app, this should come from AuthContext
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user && user.role === 'admin';

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full leading-normal">
                <thead>
                    <tr>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Product Name
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Current Qty
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Reorder Level
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Suggested Order Qty
                        </th>
                        <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        {isAdmin && (
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Action
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {products.length > 0 ? (
                        products.map((product) => (
                            <tr key={product._id}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap font-medium">{product.name}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{product.quantity}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{product.reorderLevel}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap font-bold text-blue-600">
                                        {product.suggestedOrderQty}
                                    </p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <span
                                        className={`relative inline-block px-3 py-1 font-semibold leading-tight rounded-full ${product.status === 'OUT_OF_STOCK'
                                            ? 'bg-red-200 text-red-900'
                                            : product.status === 'LOW_STOCK'
                                                ? 'bg-yellow-200 text-yellow-900'
                                                : 'bg-green-200 text-green-900'
                                            }`}
                                    >
                                        <span aria-hidden="true" className="absolute inset-0 opacity-50 rounded-full"></span>
                                        <span className="relative text-xs">
                                            {product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : product.status === 'LOW_STOCK' ? 'Low Stock' : 'Safe'}
                                        </span>
                                    </span>
                                </td>
                                {isAdmin && (
                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                        <button
                                            onClick={() => onRestock(product)}
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded text-xs transition duration-200"
                                        >
                                            Restock
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={isAdmin ? 6 : 5} className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                                No products need reordering.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReorderTable;
