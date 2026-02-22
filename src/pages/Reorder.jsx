import React, { useState, useEffect } from 'react';
import ReorderTable from '../components/ReorderTable';
import reorderService from '../services/reorderService';
import VendorOrderModal from '../components/VendorOrderModal';

import vendorOrderService from '../services/vendorOrderService';

const Reorder = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
// additional state to hold order-specific errors (so they don’t clash with fetch errors)
const [orderError, setOrderError] = useState('');

    // fetch list of products that require reordering
    const fetchReorderItems = async () => {
        setLoading(true);
        try {
            // token is taken care of by axios interceptor
            const data = await reorderService.getReorderItems();
            setProducts(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch reorder items.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchReorderItems();
    }, []);

    const handleRestockClick = (product) => {
        setSelectedProduct(product);
        setOrderError(''); // clear previous order errors
        setIsModalOpen(true);
    };

    const handlePlaceOrder = async (orderData) => {
        try {
            // reset any existing errors
            setOrderError('');
            await vendorOrderService.placeOrder({
                product: orderData.productId,
                vendor: orderData.vendorId,
                quantity: orderData.quantity,
                deliveryAddress: orderData.deliveryAddress
            });

            setIsModalOpen(false);
            setSuccessMsg(`Successfully placed order for ${selectedProduct?.name || 'product'}!`);
            setTimeout(() => setSuccessMsg(''), 5000);
            setSelectedProduct(null);
            fetchReorderItems(); // Refresh list
        } catch (err) {
            console.error('Order failed', err);
            // show specific message if available
            const msg = err.response?.data?.message || err.message || 'Failed to place vendor order';
            setOrderError(msg);
            alert(msg);
            // rethrow so calling component (modal) can handle/display the error
            throw err;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold leading-tight text-gray-800">
                        Reorder Management
                    </h2>
                    <button
                        onClick={fetchReorderItems}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}
                {/* display order-specific errors if modal was open */}
                {orderError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
                        <strong className="font-bold">Order Error!</strong>
                        <span className="block sm:inline"> {orderError}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 relative" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <span className="block sm:inline"> {successMsg}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <ReorderTable products={products} onRestock={handleRestockClick} />
                )}

                <VendorOrderModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={selectedProduct}
                    onPlaceOrder={handlePlaceOrder}
                />
            </div>
        </div>
    );
};

export default Reorder;
