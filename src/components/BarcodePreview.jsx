import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { translations } from '../utils/translations';
import { useLanguage } from '../context/LanguageContext';
import { XMarkIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const BarcodePreview = ({ isOpen, onClose, product }) => {
    const { language } = useLanguage();
    const t = translations[language];
    const barcodeRef = useRef(null);

    useEffect(() => {
        if (isOpen && product && barcodeRef.current) {
            try {
                JsBarcode(barcodeRef.current, product.barcode || product.productId, {
                    format: "CODE128",
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 14,
                    margin: 10
                });
            } catch (error) {
                console.error("Barcode generation failed", error);
            }
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleDownload = () => {
        const svgElement = barcodeRef.current;
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width + 20;
            canvas.height = img.height + 20;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 10, 10);

            const pngFile = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.download = `Barcode-${product.productId || product.name}.png`;
            a.href = pngFile;
            a.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const svgElement = barcodeRef.current;
        const svgData = new XMLSerializer().serializeToString(svgElement);

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print Barcode - ${product.name}</title>
                    <style>
                        body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; }
                        .container { text-align: center; }
                        .title { font-size: 16px; font-weight: bold; margin-bottom: 5px; }
                        .sku { font-size: 12px; color: #555; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="title">${product.name}</div>
                        <div class="sku">${product.productId}</div>
                        ${svgData}
                    </div>
                    <script>
                        window.onload = () => {
                            window.print();
                            setTimeout(() => { window.close(); }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto transition-opacity backdrop-blur-sm"
            onClick={onClose}
        >
            <style>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:max-w-md w-full m-4"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'modalFadeIn 0.3s ease-out forwards' }}
            >
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b dark:border-gray-700 flex justify-between items-center relative">
                    <div>
                        <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white">Product Added Successfully</h3>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none absolute right-4 top-5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-4 py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.productId}</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-center w-full min-h-[120px]">
                        <svg ref={barcodeRef}></svg>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-4 sm:px-6 flex flex-col sm:flex-row gap-3 justify-end items-center border-t dark:border-gray-700">
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all duration-200"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" /> Download Barcode
                    </button>
                    <button
                        onClick={handlePrint}
                        className="w-full sm:w-auto flex items-center justify-center px-6 py-2 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-[var(--color-brand-blue)] hover:bg-blue-700 focus:outline-none transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <PrinterIcon className="h-5 w-5 mr-2" /> Print Barcode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BarcodePreview;
