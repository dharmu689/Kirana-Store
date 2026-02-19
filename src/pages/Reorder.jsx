import React, { useState, useEffect } from 'react';
import ReorderTable from '../components/ReorderTable';
import reorderService from '../services/reorderService';
import RestockModal from '../components/RestockModal';

const Reorder = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const fetchReorderItems = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const data = await reorderService.getReorderItems(user.token);
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
        setIsModalOpen(true);
    };

    const handleRestockConfirm = async (id, quantity) => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            await reorderService.restockProduct(id, quantity, user.token);
            setIsModalOpen(false);
            fetchReorderItems(); // Refresh list after restock
        } catch (err) {
            console.error("Restock failed", err);
            alert("Failed to restock product. Please try again.");
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

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <ReorderTable products={products} onRestock={handleRestockClick} />
                )}

                <RestockModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    product={selectedProduct}
                    onConfirm={handleRestockConfirm}
                />
            </div>
        </div>
    );
};

export default Reorder;
