import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, TrendingUp } from 'lucide-react';
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
                // Determine a smart pre-fill quantity
                const defaultQty = product.suggestedOrderQty || Math.max(product.reorderLevel * 2 - product.quantity, product.reorderLevel + 10);
                setQuantity(defaultQty > 0 ? defaultQty : 10);
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
            // Fetch all generalized vendors as fallback, but try fetching the SMART optimized list specifically for this product
            let data = [];
            if (product && product._id) {
                try {
                    data = await vendorService.getBestVendorsForProduct(product._id);
                } catch (err) {
                    console.log("Opt vendors failed, falling back to standard list", err);
                    data = await vendorService.getVendors();
                }
            } else {
                data = await vendorService.getVendors();
            }

            setVendors(data);

            // Auto Select the highly rated Vendor dynamically natively
            if (data && data.length > 0) {
                const bestVendor = data[0];
                setSelectedVendor(bestVendor);
            }
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
                        <div className="flex justify-between items-center">
                            <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">Vendor</label>
                            {product && (
                                <Link to={`/vendor-compare/${product._id}`} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center mb-1">
                                    <TrendingUp className="w-3 h-3 mr-1" /> Compare Vendors
                                </Link>
                            )}
                        </div>
                        {loadingVendors ? (
                            <div className="mt-1 text-sm text-gray-500 flex items-center">
                                <span className="animate-spin h-4 w-4 mr-2 border-b-2 border-indigo-500 rounded-full"></span>
                                Finding optimal vendor...
                            </div>
                        ) : (
                            <select
                                id="vendor"
                                className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm ${selectedVendor?.optimizationMetrics ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium' : 'border-gray-300'}`}
                                onChange={handleVendorChange}
                                value={selectedVendor ? selectedVendor._id : ''}
                                required
                            >
                                <option value="" disabled>Select a vendor</option>
                                {vendors.map((v, idx) => (
                                    <option key={v._id} value={v._id}>
                                        {v.name} {idx === 0 && v.optimizationMetrics ? ' (★ Best Match - AI Recommended)' : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {selectedVendor && (
                        <div className={`p-4 rounded-md text-sm border ${selectedVendor.optimizationMetrics ? 'bg-indigo-50 border-indigo-100' : 'bg-gray-50 border-gray-200'}`}>
                            {selectedVendor.optimizationMetrics && (
                                <div className="mb-3 pb-3 border-b border-indigo-100 flex items-start">
                                    <div className="bg-indigo-100 p-1.5 rounded-full mr-3 mt-0.5">
                                        <Star className="w-4 h-4 text-indigo-600" fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-indigo-900 leading-tight">AI Recommended Supplier</p>
                                        <p className="text-xs text-indigo-700 mt-1">
                                            Score: {selectedVendor.optimizationMetrics.finalScore}/100 | ${selectedVendor.pricePerUnit?.toFixed(2) || '0.00'}/unit | {selectedVendor.averageDeliveryDays || '0'} Days
                                        </p>
                                    </div>
                                </div>
                            )}
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
                            Suggested quantity is {product.suggestedOrderQty || Math.max(product.reorderLevel * 2 - product.quantity, product.reorderLevel + 10)} (Reorder level is {product.reorderLevel})
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
