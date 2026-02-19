import React, { useState } from 'react';
import {
    PencilIcon,
    TrashIcon,
    ArrowsUpDownIcon,
    EllipsisVerticalIcon,
    ArchiveBoxArrowDownIcon
} from '@heroicons/react/24/outline';

const ProductTable = ({ products, onEdit, onDelete, onAdjustStock, user, onSort, sortConfig }) => {
    const isAdmin = user && user.role === 'admin';
    const [openDropdownId, setOpenDropdownId] = useState(null);

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'OUT_OF_STOCK':
                return <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">Out of Stock</span>;
            case 'LOW_STOCK':
                return <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded">Low Stock</span>;
            case 'IN_STOCK':
            default:
                return <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">In Stock</span>;
        }
    };

    const getExpiryStyle = (dateString) => {
        if (!dateString) return 'text-gray-500';
        const expiryDate = new Date(dateString);
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'text-red-600 font-bold'; // Expired
        if (diffDays <= 7) return 'text-red-500 font-semibold'; // Critical
        if (diffDays <= 30) return 'text-yellow-600 font-medium'; // Warning
        return 'text-green-600'; // Safe
    };

    const SortableHeader = ({ label, sortKey }) => (
        <th
            scope="col"
            className="py-3 px-6 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                <ArrowsUpDownIcon className={`h-4 w-4 ${sortConfig?.key === sortKey ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto relative shadow-md sm:rounded-lg min-h-[400px]">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                    <tr>
                        <SortableHeader label="Product Name" sortKey="name" />
                        <SortableHeader label="Category" sortKey="category" />
                        <SortableHeader label="Price" sortKey="price" />
                        <SortableHeader label="Stock" sortKey="quantity" />
                        <th scope="col" className="py-3 px-6">Value</th>
                        <th scope="col" className="py-3 px-6">Status</th>
                        <SortableHeader label="Sold" sortKey="totalSold" />
                        <th scope="col" className="py-3 px-6">Revenue</th>
                        <SortableHeader label="Expiry" sortKey="expiryDate" />
                        {isAdmin && <th scope="col" className="py-3 px-6 text-center">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {products.length === 0 ? (
                        <tr className="bg-white border-b hover:bg-gray-50">
                            <td colSpan={isAdmin ? 9 : 8} className="py-12 px-6 text-center text-gray-400">
                                No products found matching criteria
                            </td>
                        </tr>
                    ) : (
                        products.map((product) => (
                            <tr key={product._id} className="bg-white border-b hover:bg-gray-50">
                                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                                <td className="py-4 px-6">{product.category}</td>
                                <td className="py-4 px-6">₹{product.price}</td>
                                <td className="py-4 px-6 font-semibold">{product.quantity}</td>
                                <td className="py-4 px-6">₹{(product.price * product.quantity).toLocaleString()}</td>
                                <td className="py-4 px-6">{getStatusBadge(product.status)}</td>
                                <td className="py-4 px-6">{product.totalSold || 0}</td>
                                <td className="py-4 px-6">₹{(product.revenue || 0).toLocaleString()}</td>
                                <td className={`py-4 px-6 ${getExpiryStyle(product.expiryDate)}`}>
                                    {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                                </td>
                                {isAdmin && (
                                    <td className="py-4 px-6 text-center relative">
                                        <button
                                            onClick={() => toggleDropdown(product._id)}
                                            className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                                        >
                                            <EllipsisVerticalIcon className="h-5 w-5" />
                                        </button>

                                        {openDropdownId === product._id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => { setOpenDropdownId(null); onEdit(product); }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                    >
                                                        <PencilIcon className="h-4 w-4 mr-2" /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => { setOpenDropdownId(null); onAdjustStock(product); }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                                    >
                                                        <ArchiveBoxArrowDownIcon className="h-4 w-4 mr-2" /> Adjust Stock
                                                    </button>
                                                    <button
                                                        onClick={() => { setOpenDropdownId(null); onDelete(product); }}
                                                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                                    >
                                                        <TrashIcon className="h-4 w-4 mr-2" /> Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {/* Overlay to close dropdown on click outside */}
                                        {openDropdownId === product._id && (
                                            <div
                                                className="fixed inset-0 z-0 bg-transparent"
                                                onClick={() => setOpenDropdownId(null)}
                                            ></div>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ProductTable;
