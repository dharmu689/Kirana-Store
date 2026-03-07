import React, { useState } from 'react';
import { XMarkIcon, MagnifyingGlassIcon, PrinterIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import salesService from '../../services/salesService';

const ReceiptHistory = ({ isOpen, onClose, setReprintData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [receipts, setReceipts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError('');
        setReceipts([]);

        try {
            // Assuming the query is the exact receipt number for Phase 1. 
            // We could expand this to search by mobile via regex on backend later.
            const data = await salesService.getSaleByReceipt(searchQuery.trim().toUpperCase());
            setReceipts(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Receipt not found');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReprint = () => {
        if (receipts.length > 0) {
            // we bundle the items back together for the PDF previewer
            const aggregatedCartItems = receipts.map(sale => ({
                product: sale.product,
                quantitySold: sale.quantitySold
            }));

            setReprintData({
                receiptNumber: receipts[0].receiptNumber,
                customerName: receipts[0].customerName,
                customerMobile: receipts[0].customerMobile,
                paymentMethod: receipts[0].paymentMethod,
                totalAmount: receipts.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2),
                cartItems: aggregatedCartItems,
                date: new Date(receipts[0].createdAt).toLocaleString()
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
                    <h2 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-100">
                        <DocumentDuplicateIcon className="h-6 w-6 mr-2 text-indigo-500" />
                        Receipt History
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSearch} className="mb-6 relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Enter Receipt Number (e.g. REC-123456000)"
                            className="w-full pl-12 pr-4 py-3 border-2 border-indigo-100 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-indigo-500/20 bg-gray-50 dark:bg-gray-900 focus:bg-white text-gray-900 dark:text-gray-100 font-mono text-lg"
                        />
                        <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
                        <button type="submit" className="absolute right-2 top-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-indigo-700 text-sm shadow-sm transition-colors">
                            {isLoading ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mb-4 text-center font-bold font-mono">
                            {error}
                        </div>
                    )}

                    {receipts.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg font-mono text-gray-900 dark:text-white mb-1">{receipts[0].receiptNumber}</h3>
                                    <p className="text-sm text-gray-500">Date: {new Date(receipts[0].createdAt).toLocaleString()}</p>
                                    {(receipts[0].customerName || receipts[0].customerMobile) && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">
                                            Customer: {receipts[0].customerName} {receipts[0].customerMobile && `(${receipts[0].customerMobile})`}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                                        ₹{receipts.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold uppercase">{receipts[0].paymentMethod}</span>
                                </div>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase border-b border-gray-100 dark:border-gray-700">
                                        <tr>
                                            <th className="px-4 py-2">Item</th>
                                            <th className="px-4 py-2 text-center">Qty</th>
                                            <th className="px-4 py-2 text-right">Price</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {receipts.map(item => (
                                            <tr key={item._id} className="text-gray-700 dark:text-gray-300">
                                                <td className="px-4 py-3 font-medium">{item.productName}</td>
                                                <td className="px-4 py-3 text-center bg-gray-50/50 dark:bg-gray-800/30">{item.quantitySold}</td>
                                                <td className="px-4 py-3 text-right">₹{item.unitPrice.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">₹{item.totalPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-right">
                                <button
                                    onClick={handleReprint}
                                    className="inline-flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-sm transition-colors"
                                >
                                    <PrinterIcon className="h-5 w-5 mr-2" />
                                    Reprint Receipt
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptHistory;
