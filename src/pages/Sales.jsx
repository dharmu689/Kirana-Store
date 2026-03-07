import React, { useState, useEffect, useRef } from 'react';
import salesService from '../services/salesService';
import productService from '../services/productService';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';
import { playBeep, playErrorBeep } from '../utils/audio';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Modern POS Components
import CameraScanner from '../components/CameraScanner';
import ManualSearch from '../components/pos/ManualSearch';
import CartPanel from '../components/pos/CartPanel';
import ReceiptHistory from '../components/pos/ReceiptHistory';
import Receipt from '../components/Receipt';
import SalesTable from '../components/SalesTable';

// Icons
import { VideoCameraIcon, MagnifyingGlassIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import html2pdf from 'html2pdf.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Sales = () => {
    const { language } = useLanguage();
    const t = translations[language];

    // POS State
    const [cart, setCart] = useState([]);
    const [isScannerMode, setIsScannerMode] = useState(true);
    const [products, setProducts] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isProcessing, setIsProcessing] = useState(false);

    // Cache for products to avoid stale closure in scanner callback
    const productsRef = useRef([]);

    // Receipt Printing State
    const [reprintData, setReprintData] = useState(null);
    const [isReceiptHistoryOpen, setIsReceiptHistoryOpen] = useState(false);
    const receiptRef = useRef();

    // Sales Overview State
    const [sales, setSales] = useState([]);
    const [summary, setSummary] = useState({ totalRevenue: 0, totalSalesCount: 0, monthlyBreakdown: [] });
    const [profitSum, setProfitSum] = useState({ totalRevenue: 0, totalProfit: 0, todayProfit: 0 });

    useEffect(() => {
        fetchSalesData();
        fetchProducts();
    }, []);

    const fetchSalesData = async () => {
        try {
            const [salesData, summaryData, profitData] = await Promise.all([
                salesService.getSales(),
                salesService.getSalesSummary(),
                salesService.getProfitSummary()
            ]);
            setSales(salesData);
            setSummary(summaryData);
            setProfitSum(profitData);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
            productsRef.current = data; // Keep ref updated for scanner
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    // --- POS Logic ---

    const processProductForCart = (product) => {
        if (!product || product.quantity <= 0) {
            playErrorBeep();
            return;
        }

        playBeep();

        setCart((prevCart) => {
            const existingItemIndex = prevCart.findIndex((item) => item.product._id === product._id);
            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                if (newCart[existingItemIndex].quantitySold < product.quantity) {
                    newCart[existingItemIndex] = {
                        ...newCart[existingItemIndex],
                        quantitySold: newCart[existingItemIndex].quantitySold + 1
                    };
                    return newCart;
                } else {
                    return prevCart; // cannot add more than stock
                }
            } else {
                return [...prevCart, { product, quantitySold: 1 }];
            }
        });
    };

    const handleBarcodeScan = async (barcode) => {
        if (!barcode) return;
        try {
            // First check local products array for zero-latency
            let product = products.find(p => p.productId === barcode || p.barcode === barcode);

            // If not found locally, check backend
            if (!product) {
                product = await productService.getProductByBarcode(barcode);
            }

            if (product) {
                processProductForCart(product);
            } else {
                playErrorBeep();
            }
        } catch (error) {
            playErrorBeep();
            console.error("Barcode scan lookup failed", error);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const productData = products.find(p => p._id === productId);
        if (newQuantity < 1) return;
        if (productData && newQuantity > productData.quantity) return;

        setCart(cart.map(item =>
            item.product._id === productId ? { ...item, quantitySold: newQuantity } : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product._id !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        try {
            const saleData = {
                items: cart.map(item => ({
                    product: item.product._id,
                    quantitySold: item.quantitySold
                })),
                paymentMethod,
                customerName: customerName.trim(),
                customerMobile: customerMobile.trim()
            };

            const response = await salesService.createSale(saleData);

            // Trigger silent print PDF based on generated receipt API response
            setReprintData({
                receiptNumber: response.receiptNumber,
                customerName: customerName.trim(),
                customerMobile: customerMobile.trim(),
                paymentMethod: paymentMethod,
                totalAmount: cartTotal,
                cartItems: [...cart],
                date: new Date().toLocaleString()
            });

            // UI feedback
            playBeep();
            alert(`Sale Completed!\nReceipt: ${response.receiptNumber}`);

            // Reset cart
            setCart([]);
            setCustomerName('');
            setCustomerMobile('');
            setPaymentMethod('Cash');
            fetchProducts();
            fetchSalesData();

        } catch (error) {
            playErrorBeep();
            console.error(error);
            alert(error.response?.data?.message || 'Error processing sale');
        } finally {
            setIsProcessing(false);
        }
    };

    // Auto trigger PDF generation when reprintData changes
    useEffect(() => {
        if (reprintData && receiptRef.current) {
            const opt = {
                margin: 10,
                filename: `Invoice_${reprintData.receiptNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(receiptRef.current).set(opt).save().then(() => {
                setReprintData(null);
            });
        }
    }, [reprintData]);

    const cartTotal = cart.reduce((total, item) => {
        const price = item.product.sellingPrice || item.product.price;
        return total + (price * item.quantitySold);
    }, 0).toFixed(2);


    const chartData = {
        labels: summary.monthlyBreakdown.map(item => {
            const date = new Date();
            date.setMonth(item._id - 1);
            return date.toLocaleString('default', { month: 'short' });
        }),
        datasets: [{
            label: 'Monthly Revenue',
            data: summary.monthlyBreakdown.map(item => item.revenue),
            borderColor: 'var(--color-brand-blue)',
            backgroundColor: 'rgba(56, 113, 193, 0.2)',
            tension: 0.3
        }],
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">POS Terminal</h1>
                    <p className="text-gray-500 font-medium mt-1">Professional Split-Pane Mode</p>
                </div>
                <button
                    onClick={() => setIsReceiptHistoryOpen(true)}
                    className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-sm border border-indigo-100 dark:border-indigo-800"
                >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                    Receipt History
                </button>
            </div>

            {/*  40/60 PROFESSIONAL POS GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 lg:h-[700px]">

                {/* LEFT PANE (40%) - Input Source */}
                <div className="xl:col-span-2 flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                    <div className="flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 p-2 gap-2">
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isScannerMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setIsScannerMode(true)}
                        >
                            <VideoCameraIcon className="h-5 w-5" /> Camera Scanner
                        </button>
                        <button
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${!isScannerMode ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            onClick={() => setIsScannerMode(false)}
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" /> Manual Search
                        </button>
                    </div>
                    <div className="flex-1 p-6 relative overflow-hidden">
                        <div className={`transition-opacity duration-300 absolute inset-0 p-6 ${isScannerMode ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            <CameraScanner
                                isOpen={true}
                                scannerActive={isScannerMode}
                                onScanSuccess={handleBarcodeScan}
                            />
                        </div>
                        <div className={`transition-opacity duration-300 absolute inset-0 p-6 ${!isScannerMode ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            <ManualSearch
                                products={products}
                                onSelectProduct={processProductForCart}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANE (60%) - CartPanel component */}
                <div className="xl:col-span-3 h-[600px] xl:h-[700px]">
                    <CartPanel
                        cart={cart}
                        updateQuantity={updateQuantity}
                        removeFromCart={removeFromCart}
                        clearCart={() => setCart([])}
                        customerName={customerName}
                        setCustomerName={setCustomerName}
                        customerMobile={customerMobile}
                        setCustomerMobile={setCustomerMobile}
                        paymentMethod={paymentMethod}
                        setPaymentMethod={setPaymentMethod}
                        cartTotal={cartTotal}
                        handleCheckout={handleCheckout}
                        isProcessing={isProcessing}
                    />
                </div>
            </div>

            <hr className="border-gray-200 dark:border-gray-800 my-8" />

            {/* Legacy Dashboard Below */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center"><span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm mr-3">Analytics</span> Financial Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/70 dark:bg-gray-900/60 p-6 rounded-2xl shadow-sm border-l-4 border-l-indigo-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Revenue</h3>
                        <p className="text-2xl font-bold text-indigo-600 mt-2">₹{profitSum.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-900/60 p-6 rounded-2xl shadow-sm border-l-4 border-l-green-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Profit</h3>
                        <p className="text-2xl font-bold text-green-600 mt-2">₹{profitSum.totalProfit.toLocaleString()}</p>
                    </div>
                    <div className="bg-white/70 dark:bg-gray-900/60 p-6 rounded-2xl shadow-sm border-l-4 border-l-blue-500">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Today's Profit</h3>
                        <p className="text-2xl font-bold text-blue-600 mt-2">₹{profitSum.todayProfit.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <SalesTable sales={sales} />
            </div>

            {/* Hidden PDF Receipt Generator */}
            {reprintData && (
                <Receipt
                    ref={receiptRef}
                    cartItems={reprintData.cartItems}
                    totalAmount={reprintData.totalAmount}
                    paymentMethod={reprintData.paymentMethod}
                    receiptNumber={reprintData.receiptNumber}
                    customerName={reprintData.customerName}
                    customerMobile={reprintData.customerMobile}
                    dateOverride={reprintData.date}
                />
            )}

            {/* History Modal */}
            <ReceiptHistory
                isOpen={isReceiptHistoryOpen}
                onClose={() => setIsReceiptHistoryOpen(false)}
                setReprintData={setReprintData}
            />
        </div>
    );
};

export default Sales;
