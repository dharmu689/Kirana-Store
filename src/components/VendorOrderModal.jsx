import React, { useState, useEffect } from 'react';
import vendorService from '../services/vendorService';

const VendorOrderModal = ({ isOpen, onClose, product, onPlaceOrder }) => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [loadingVendors, setLoadingVendors] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchVendors();
            if (product) {
                setQuantity(product.suggestedOrderQty || 10); // default to suggested or 10
            }
        } else {
            // Reset form on close
            setSelectedVendor(null);
            setQuantity('');
            setDeliveryAddress('');
            setError('');
        }
    }, [isOpen, product]);

    const fetchVendors = async () => {
        setLoadingVendors(true);
        try {
            const data = await vendorService.getVendors();
            setVendors(data);
        } catch (err) {
            console.error('Failed to fetch vendors:', err);
            setError('Failed to fetch vendors. Please try again.');
        } finally {
            setLoadingVendors(false);
        }
    };

    const handleVendorChange = (e) => {
        const vendorId = e.target.value;
        const vendor = vendors.find((v) => v._id === vendorId);
        setSelectedVendor(vendor || null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!selectedVendor) {
            setError('Please select a vendor.');
            return;
        }

        if (quantity < 1) {
            setError('Quantity must be at least 1.');
            return;
        }

        onPlaceOrder({
            productId: product._id,
            vendorId: selectedVendor._id,
            quantity: Number(quantity),
            deliveryAddress
        });
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-8 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-xl font-semibold text-gray-900 leading-tight">
                        Place Vendor Order
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500 transition ease-in-out duration-150"
                    >
                        <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product</label>
                        <input
                            type="text"
                            value={product.name}
                            disabled
                            className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-500 cursor-not-allowed sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
                        {loadingVendors ? (
                            <div className="mt-1 text-sm text-gray-500">Loading vendors...</div>
                        ) : (
                            <select
                                id="vendor"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                onChange={handleVendorChange}
                                value={selectedVendor ? selectedVendor._id : ''}
                                required
                            >
                                <option value="" disabled>Select a vendor</option>
                                {vendors.map((v) => (
                                    <option key={v._id} value={v._id}>
                                        {v.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {selectedVendor && (
                        <div className="bg-gray-50 p-3 rounded-md text-sm border border-gray-200">
                            <p className="font-semibold text-gray-800 mb-1">Vendor Contact Info:</p>
                            <p><span className="text-gray-500">Person:</span> {selectedVendor.contactPerson || 'N/A'}</p>
                            <p><span className="text-gray-500">Phone:</span> {selectedVendor.phone || 'N/A'}</p>
                            <p><span className="text-gray-500">Email:</span> {selectedVendor.email || 'N/A'}</p>
                        </div>
                    )}

                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Order Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Suggested quantity is {product.suggestedOrderQty} (Reorder level is {product.reorderLevel})
                        </p>
                    </div>

                    <div>
                        <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">Delivery Address</label>
                        <textarea
                            id="deliveryAddress"
                            rows="2"
                            className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border"
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Optional: Store location to deliver to"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 disabled:opacity-50"
                            disabled={!selectedVendor}
                        >
                            Place Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorOrderModal;
