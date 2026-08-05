import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CameraScanner from './CameraScanner';

const ScanProductModal = ({ isOpen, onClose, onScanSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900 bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Scan Product Barcode
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <CameraScanner 
                        isOpen={isOpen} 
                        onScanSuccess={onScanSuccess} 
                        scannerActive={isOpen} 
                    />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScanProductModal;
