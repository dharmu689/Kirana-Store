import React from 'react';
import { ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

const CartPanel = ({
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    customerName,
    setCustomerName,
    customerMobile,
    setCustomerMobile,
    paymentMethod,
    setPaymentMethod,
    cartTotal,
    handleCheckout,
    isProcessing
}) => {

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full overflow-hidden">

            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800/80 px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <ShoppingCartIcon className="h-6 w-6 text-indigo-500" />
                    Current Order
                </h2>
                <div className="flex gap-2">
                    <span className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold px-3 py-1.5 rounded-full">
                        {cart.length} Items
                    </span>
                    {cart.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="text-white hover:text-white bg-red-400 hover:bg-red-500 rounded-full p-1.5 transition-colors"
                            title="Clear Order"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cart Items Area (Scrollable) */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30 dark:bg-black/10">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <ShoppingCartIcon className="h-16 w-16 text-gray-200 dark:text-gray-700 mb-4" />
                        <p className="text-gray-400 dark:text-gray-500 font-medium text-lg">Cart is empty.</p>
                        <p className="text-gray-400 dark:text-gray-600 text-sm mt-1">Scan a barcode or search to add items.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cart.map((item) => {
                            const price = item.product.sellingPrice || item.product.price;
                            const itemTotal = price * item.quantitySold;
                            return (
                                <li key={item.product._id} className="p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-gray-900 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight">{item.product.name}</h4>
                                        <p className="text-sm text-gray-500 font-mono mt-1">₹{price.toFixed(2)}/each</p>
                                    </div>

                                    <div className="flex items-center gap-4 justify-between xl:justify-end">
                                        {/* Stepper */}
                                        <div className="flex items-center border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantitySold - 1)}
                                                className="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 transition-colors font-bold"
                                            >
                                                <MinusIcon className="h-4 w-4" />
                                            </button>
                                            <input
                                                type="number"
                                                className="w-12 text-center text-sm font-bold border-none focus:ring-0 p-0 bg-transparent text-gray-800 dark:text-gray-200"
                                                value={item.quantitySold}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (!isNaN(val)) updateQuantity(item.product._id, val);
                                                }}
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantitySold + 1)}
                                                className="px-3 py-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-green-500 transition-colors font-bold"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="w-24 text-right">
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">
                                                ₹{itemTotal.toFixed(2)}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                                            title="Remove item"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Checkout Footer Area */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">

                {/* Customer Details Row */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Customer Name (Optional)"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full text-sm p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900"
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Mobile No. (Optional)"
                            value={customerMobile}
                            onChange={(e) => setCustomerMobile(e.target.value)}
                            className="w-full text-sm p-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-900"
                        />
                    </div>
                </div>

                {/* Subtotals & Payment */}
                <div className="flex flex-col mb-4 space-y-2">
                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">Payment Method</span>
                        <div className="flex bg-gray-200/50 dark:bg-gray-800 p-1 rounded-lg">
                            {['Cash', 'UPI', 'Card'].map(method => (
                                <button
                                    key={method}
                                    type="button"
                                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${paymentMethod === method ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                                    onClick={() => setPaymentMethod(method)}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-6 px-1">
                    <span className="text-gray-500 dark:text-gray-400 font-bold text-lg">Grand Total</span>
                    <span className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">₹{cartTotal}</span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0 || isProcessing}
                    className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xl shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
                >
                    {isProcessing ? 'Processing...' : 'FINALIZE SALE'}
                </button>
            </div>
        </div>
    );
};

export default CartPanel;
