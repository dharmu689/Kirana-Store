import React, { useState } from 'react';

const StockAdjustmentModal = ({ isOpen, onClose, onSubmit, product }) => {
    const [adjustment, setAdjustment] = useState('');
    const [reason, setReason] = useState(''); // Future use

    if (!isOpen || !product) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(product._id, Number(adjustment));
        setAdjustment('');
        onClose();
    };

    const newQuantity = (product.quantity || 0) + (Number(adjustment) || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                        Adjust Stock: {product.name}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-4 rounded-md">
                        <p className="text-sm text-blue-800">
                            Current Stock: <span className="font-bold">{product.quantity}</span>
                        </p>
                        <p className="text-sm text-blue-800 mt-1">
                            New Stock: <span className={`font-bold ${newQuantity < 0 ? 'text-red-600' : ''}`}>{newQuantity}</span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Adjustment Amount (+/-)
                        </label>
                        <input
                            type="number"
                            value={adjustment}
                            onChange={(e) => setAdjustment(e.target.value)}
                            required
                            placeholder="e.g. 10 or -5"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Enter negative value to reduce stock.
                        </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!adjustment || newQuantity < 0}
                        >
                            Confirm Adjustment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockAdjustmentModal;
