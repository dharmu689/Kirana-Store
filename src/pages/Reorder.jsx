import React, { useState, useEffect } from 'react';
import ReorderTable from '../components/ReorderTable';
import reorderService from '../services/reorderService';
import VendorOrderModal from '../components/VendorOrderModal';

import vendorOrderService from '../services/vendorOrderService';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import toast from 'react-hot-toast';

const Reorder = () => {
    const { language } = useLanguage();
    const t = translations[language];

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // fetch list of products that require reordering
    const fetchReorderItems = async () => {
        setLoading(true);
        try {
            const data = await reorderService.getReorderItems();
            setProducts(data);
        } catch (err) {
            toast.error('Failed to fetch reorder items.');
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
        setIsModalOpen(true);
    };

    const handlePlaceOrder = async (orderData) => {
        try {
            await vendorOrderService.placeOrder({
                product: orderData.productId,
                vendor: orderData.vendorId,
                quantity: orderData.quantity,
                deliveryAddress: orderData.deliveryAddress
            });

            setIsModalOpen(false);
            toast.success('Vendor Order Placed Successfully');
            setSelectedProduct(null);
            fetchReorderItems(); // Refresh list
        } catch (err) {
            console.error('Order failed', err);
            const msg = err.response?.data?.message || err.message || 'Failed to place vendor order';
            toast.error(msg);
            throw err;
        }
    };

    return (
        <div className="container mx-auto px-4 sm:px-8">
            <div className="py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {t.reorderList || "Reorder Management"}
                    </h2>
                    <button
                        onClick={fetchReorderItems}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200 flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Refresh
                    </button>
                </div>

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
