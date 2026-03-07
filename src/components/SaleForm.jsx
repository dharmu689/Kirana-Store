import { useState, useEffect, useRef } from 'react';
import { QrCodeIcon, ShoppingCartIcon, XMarkIcon, PlusIcon, MinusIcon, PrinterIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import html2pdf from 'html2pdf.js';
import productService from '../services/productService';
import salesService from '../services/salesService';
import CameraScanner from './CameraScanner';
import Receipt from './Receipt';

const SaleForm = ({ onSaleAdded }) => {
    const receiptRef = useRef();
    const barcodeInputRef = useRef(null);
    const [lastSale, setLastSale] = useState(null);

    const [products, setProducts] = useState([]);

    // Cart State
    const [cart, setCart] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Cash');

    // Form Selection State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantityToAdd, setQuantityToAdd] = useState(1);
    const [barcodeInput, setBarcodeInput] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    // Toast Notification State
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        loadProducts();

        // Aggressive Auto-Focus Logic for Hardware Scanner
        const handleWindowClick = (e) => {
            const activeTag = document.activeElement?.tagName;
            // If user clicks outside inputs/buttons, re-focus the scanner input
            if (activeTag !== 'INPUT' && activeTag !== 'SELECT' && activeTag !== 'BUTTON' && activeTag !== 'A') {
                barcodeInputRef.current?.focus();
            }
        };

        window.addEventListener('click', handleWindowClick);
        return () => window.removeEventListener('click', handleWindowClick);
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            console.error('Failed to load products', err);
        }
    };

    const triggerToast = (message) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleProductSelect = (e) => {
        setSelectedProductId(e.target.value);
        setQuantityToAdd(1);
    };

    const addToCart = (product, requestedQuantity = 1) => {
        if (!product) return;

        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.product._id === product._id);
            const currentCartQuantity = existingItem ? existingItem.quantitySold : 0;
            const newTotalQuantity = currentCartQuantity + requestedQuantity;

            if (newTotalQuantity > product.quantity) {
                setError(`Cannot add more. Max available stock for ${product.name} is ${product.quantity}.`);
                return prevCart;
            }

            triggerToast(`${product.name} added to cart!`);

            if (existingItem) {
                return prevCart.map(item =>
                    item.product._id === product._id
                        ? { ...item, quantitySold: newTotalQuantity }
                        : item
                );
            } else {
                return [...prevCart, { product, quantitySold: requestedQuantity }];
            }
        });

        // Reset manual selection
        setSelectedProductId('');
        setQuantityToAdd(1);
    };

    const handleManualAdd = () => {
        setError('');
        const product = products.find(p => p._id === selectedProductId);
        if (product) {
            addToCart(product, Number(quantityToAdd));
        }
    };

    const handleBarcodeSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const barcode = barcodeInput.trim();
        if (!barcode) return;

        setBarcodeInput(''); // Clear immediately for rapid scanning

        try {
            // strict backend lookup for robustness
            const product = await productService.getProductByBarcode(barcode);
            if (product) {
                addToCart(product, 1);
            }
        } catch (err) {
            setError(`Product with barcode "${barcode}" not found.`);
        }

        // Force focus back
        setTimeout(() => barcodeInputRef.current?.focus(), 10);
    };

    const handleScanSuccess = async (decodedText) => {
        try {
            let scannedId = decodedText;
            try {
                // Legacy: parse JSON from old QR format
                const qrData = JSON.parse(decodedText);
                if (qrData.productId) scannedId = qrData.productId;
            } catch (jsonErr) {
                // Standard Barcode
            }

            const product = await productService.getProductByBarcode(scannedId.trim());
            if (product) {
                addToCart(product, 1);
            }
        } catch (e) {
            setError(`Scanned product "${decodedText}" not found in inventory.`);
        }
    };

    const updateCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        const product = products.find(p => p._id === productId);
        if (newQuantity > product.quantity) {
            setError(`Cannot add more. Max available stock for ${product.name} is ${product.quantity}.`);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.product._id === productId
                    ? { ...item, quantitySold: newQuantity }
                    : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.product._id !== productId));
    };

    const handleCheckout = async () => {
        setError('');
        setSuccess('');

        if (cart.length === 0) {
            setError('Cart is empty.');
            return;
        }

        try {
            // Process each cart item as a separate sale record
            // For a production app, a bulk insert endpoint would be better, but we reuse existing logic
            for (const item of cart) {
                await salesService.createSale({
                    product: item.product._id,
                    quantitySold: item.quantitySold,
                    paymentMethod: paymentMethod
                });
            }

            // Save details for receipt before clearing cart
            setLastSale({
                cartItems: [...cart],
                totalAmount: cartTotal,
                paymentMethod: paymentMethod
            });

            setSuccess('Checkout completed successfully!');
            setCart([]);
            setPaymentMethod('Cash');
            if (onSaleAdded) onSaleAdded();

            // Reload products to get updated stock
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process checkout. Some items may not have been recorded.');
        }
    };

    const handleDownloadReceipt = () => {
        if (!receiptRef.current) return;
        const opt = {
            margin: 0.5,
            filename: `Receipt-${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a5', orientation: 'portrait' }
        };
        html2pdf().from(receiptRef.current).set(opt).save();
    };

    const handlePrintReceipt = () => {
        if (!receiptRef.current) return;
        const opt = {
            margin: 0.5,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a5', orientation: 'portrait' }
        };
        html2pdf().from(receiptRef.current).set(opt).outputPdf().then(function (pdf) {
            const blob = new Blob([pdf], { type: 'application/pdf' });
            const blobURL = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            document.body.appendChild(iframe);
            iframe.style.display = 'none';
            iframe.src = blobURL;
            iframe.onload = function () {
                setTimeout(function () {
                    iframe.focus();
                    iframe.contentWindow.print();
                }, 1);
            };
        });
    };

    const cartTotal = cart.reduce((total, item) => {
        const itemPrice = item.product.sellingPrice || item.product.price;
        return total + (itemPrice * item.quantitySold);
    }, 0).toFixed(2);

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6 relative">

            {/* Toast Notification */}
            <div className={`absolute top-4 right-4 z-50 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-medium">
                    <ShoppingCartIcon className="h-5 w-5" />
                    {toastMessage}
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Point of Sale</h2>
                    <p className="text-sm text-gray-500 mt-1">Scan QR codes or manually add items to the cart.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="flex items-center px-4 py-2 bg-[var(--color-brand-orange)] text-white rounded-lg shadow-md hover:bg-orange-600 transition duration-200 font-bold hover-mac-folder"
                >
                    <QrCodeIcon className="h-5 w-5 mr-2" />
                    Scan Product
                </button>
            </div>

            {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 mb-4">{error}</div>}
            {success && (
                <div className="bg-green-50/80 dark:bg-green-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 mb-8 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="text-green-700 dark:text-green-400 font-bold mb-4 text-xl flex items-center gap-2">
                        <span className="bg-green-500 text-white rounded-full p-1"><XMarkIcon className="h-4 w-4 hidden" /> ✓</span>
                        {success}
                    </div>
                    {lastSale && (
                        <div className="flex gap-4">
                            <button
                                onClick={handlePrintReceipt}
                                className="flex items-center px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition font-medium"
                            >
                                <PrinterIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                                Print Receipt
                            </button>
                            <button
                                onClick={handleDownloadReceipt}
                                className="flex items-center px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm transition font-medium hover-mac-folder shadow-green-600/20"
                            >
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                                Download PDF
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Hardware Scanner Input Form */}
            <form onSubmit={handleBarcodeSubmit} className="mb-6">
                <input
                    ref={barcodeInputRef}
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="Scan or type barcode here and press Enter..."
                    className="w-full p-4 text-lg border-2 border-[var(--color-brand-blue)] rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30 bg-white dark:bg-gray-800 font-mono shadow-sm"
                    autoFocus
                />
            </form>

            {/* Manual Add Form */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-6">
                <div className="md:col-span-6 lg:col-span-7">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Product Manually</label>
                    <select
                        value={selectedProductId}
                        onChange={handleProductSelect}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] bg-white dark:bg-gray-800"
                    >
                        <option value="">-- Choose a product --</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id} disabled={product.quantity <= 0}>
                                {product.name} - ₹{product.sellingPrice || product.price} (Stock: {product.quantity})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-3 lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qty</label>
                    <input
                        type="number"
                        value={quantityToAdd}
                        onChange={(e) => setQuantityToAdd(e.target.value)}
                        min="1"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-blue)] bg-white dark:bg-gray-800"
                        disabled={!selectedProductId}
                    />
                </div>

                <div className="md:col-span-3 lg:col-span-3">
                    <button
                        type="button"
                        onClick={handleManualAdd}
                        disabled={!selectedProductId}
                        className="w-full bg-gray-800 dark:bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Cart Display */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" /> Current Cart
                    </h3>
                    <span className="bg-[var(--color-brand-blue)] text-white text-xs font-bold px-2 py-1 rounded-full">
                        {cart.length} items
                    </span>
                </div>

                {cart.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                        Cart is empty. Scan a QR code or add items manually.
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {cart.map((item) => {
                            const price = item.product.sellingPrice || item.product.price;
                            const itemTotal = price * item.quantitySold;
                            return (
                                <li key={item.product._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-900 dark:text-gray-100">{item.product.name}</h4>
                                        <p className="text-sm text-gray-500">₹{price} per unit</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
                                            <button
                                                onClick={() => updateCartQuantity(item.product._id, item.quantitySold - 1)}
                                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <MinusIcon className="h-4 w-4" />
                                            </button>
                                            <span className="w-10 text-center text-sm font-medium border-x border-gray-300 dark:border-gray-600 py-1">
                                                {item.quantitySold}
                                            </span>
                                            <button
                                                onClick={() => updateCartQuantity(item.product._id, item.quantitySold + 1)}
                                                className="px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                            >
                                                <PlusIcon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="w-20 text-right font-bold text-[var(--color-brand-blue)]">
                                            ₹{itemTotal.toFixed(2)}
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.product._id)}
                                            className="text-red-400 hover:text-red-600 p-1"
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

            {/* Checkout Section */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 dark:bg-[var(--color-brand-blue)]/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                    <label className="text-sm font-medium text-blue-900 dark:text-blue-200 whitespace-nowrap">Payment Method:</label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="p-2 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-sm font-medium"
                    >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </div>

                <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Grand Total</p>
                        <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">₹{cartTotal}</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="bg-[var(--color-brand-blue)] text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover-mac-folder shadow-blue-500/30"
                    >
                        Checkout
                    </button>
                </div>
            </div>

            <CameraScanner
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={handleScanSuccess}
            />

            {lastSale && (
                <Receipt
                    ref={receiptRef}
                    cartItems={lastSale.cartItems}
                    totalAmount={lastSale.totalAmount}
                    paymentMethod={lastSale.paymentMethod}
                />
            )}
        </div>
    );
};

export default SaleForm;
