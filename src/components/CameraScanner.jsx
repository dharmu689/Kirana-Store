import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const CameraScanner = ({ isOpen, onClose, onScanSuccess }) => {
    useEffect(() => {
        let scanner = null;
        if (isOpen) {
            scanner = new Html5QrcodeScanner(
                "camera-reader",
                { fps: 10, qrbox: { width: 250, height: 150 } }, // wider for barcodes
                /* verbose= */ false
            );

            scanner.render(
                (decodedText) => {
                    // Feature 8: Stop scanner automatically
                    onScanSuccess(decodedText);
                    scanner.clear();
                    onClose();
                },
                (errorMessage) => {
                    // Ignore continuous background scan errors
                }
            );
        }

        return () => {
            if (scanner && scanner.getState && scanner.getState() !== 1) { // 1 is UNKNOWN
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner.", error);
                });
            }
        };
    }, [isOpen, onScanSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75 dark:bg-gray-900/90 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col items-center p-6 border border-gray-100 dark:border-gray-700">

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                    Scan Product
                </h2>

                {/* Feature 6: Scanner modal design - Camera View */}
                <div className="w-full bg-black/5 rounded-xl overflow-hidden mb-4 border-2 border-dashed border-gray-300 dark:border-gray-600 relative min-h-[300px] flex items-center justify-center">
                    <div id="camera-reader" className="w-full h-full"></div>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 text-center">
                    Align barcode inside the box.
                </p>

                {/* Cancel button below camera */}
                <button
                    onClick={onClose}
                    className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl font-bold transition-colors"
                >
                    Cancel
                </button>
            </div>

            <style>
                {/* CSS override to fix html5-qrcode ugly default UI */}
                {`
                    #camera-reader { width: 100%; border: none !important; }
                    #camera-reader img { display: none !important; }
                    #camera-reader button { 
                        padding: 8px 16px; 
                        background: var(--color-brand-blue, #3b82f6); 
                        color: white; 
                        border-radius: 8px; 
                        border: none;
                        font-weight: 600;
                        margin: 10px 0;
                        cursor: pointer;
                    }
                    #camera-reader a { display: none !important; }
                    #camera-reader__scan_region { min-height: 250px; display: flex; align-items: center; justify-content: center; background: black; }
                    #camera-reader__dashboard_section_csr span { color: transparent !important; }
                `}
            </style>
        </div>
    );
};

export default CameraScanner;
