import React from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Box, CreditCard } from 'lucide-react';

const BarcodePOSSection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-gray-50 dark:bg-gray-800/30 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col-reverse lg:flex-row items-center gap-16">

                    {/* Left Text Content */}
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b] dark:text-white leading-tight">
                                Lightning Fast <br />
                                <span className="text-[#f97316]">Barcode POS System</span>.
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                                Process customer checkouts in seconds. Use your existing USB barcode scanner or the built-in mobile camera scanner directly from any browser or tablet.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <ScanLine className="text-[#f97316] mb-3" size={24} />
                                    <h5 className="font-bold text-gray-900 dark:text-white mb-1">Mobile Scanning</h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Use any smartphone camera to scan items on the go.</p>
                                </div>
                                <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <CreditCard className="text-[#3b82f6] mb-3" size={24} />
                                    <h5 className="font-bold text-gray-900 dark:text-white mb-1">Quick Checkout</h5>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Cash, UPI, and instant bill generation.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Graphic Node (Placeholder UI Graphic) */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-900/20 dark:to-red-900/10 rounded-3xl transform -rotate-3 scale-105" />
                        <div className="relative bg-[#1e293b] rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
                            {/* Fake Terminal Header */}
                            <div className="bg-gray-900 px-4 py-3 flex items-center border-b border-gray-700/50">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                </div>
                                <span className="text-gray-400 text-xs font-mono ml-4">POS / KiranaSmart</span>
                            </div>
                            {/* Fake POS Body */}
                            <div className="p-6 font-mono">
                                <div className="flex justify-between text-gray-300 text-sm mb-4 pb-2 border-b border-gray-700 border-dashed">
                                    <span>Scan Item...</span>
                                    <span>[waiting]</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-green-400 text-sm">
                                        <span>+ Surf Excel Matic 1kg (BAR: 1004)</span>
                                        <span>₹260.00</span>
                                    </div>
                                    <div className="flex justify-between text-green-400 text-sm">
                                        <span>+ Haldiram Bhujia 400g (BAR: 8820)</span>
                                        <span>₹95.00</span>
                                    </div>
                                </div>
                                <div className="mt-8 pt-4 border-t border-gray-700 flex justify-between text-white font-bold text-lg">
                                    <span>TOTAL</span>
                                    <span>₹355.00</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default BarcodePOSSection;
