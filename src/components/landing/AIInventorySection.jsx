import React from 'react';
import { motion } from 'framer-motion';
import { ScanBarcode, Layers, Zap } from 'lucide-react';

const AIInventorySection = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-white dark:bg-gray-900 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Graphic Node (Placeholder UI Graphic) */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="w-full lg:w-1/2 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-3xl transform rotate-3 scale-105" />
                        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
                                    <Layers size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Low Stock Alert</h4>
                                    <p className="text-xs text-gray-500">Aashirvaad Atta 5kg • Only 2 left</p>
                                </div>
                                <div className="ml-auto bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium">Reorder</div>
                            </div>
                            <div className="h-24 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse" />
                            <div className="h-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 animate-pulse w-3/4" />
                        </div>
                    </motion.div>

                    {/* Right Text Content */}
                    <div className="w-full lg:w-1/2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#1e293b] dark:text-white leading-tight">
                                Never run out of your <br />
                                <span className="text-[#3b82f6]">best-selling items</span>.
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                                KiranaSmart automatically tracks your shelves and learns your fast-moving goods based on historical sales trends. Receive smart push notifications before you run out.
                            </p>

                            <ul className="space-y-4">
                                {[
                                    "Dynamic Reorder Levels depending on product category.",
                                    "Auto-generate PDF invoices to send straight to vendors via WhatsApp.",
                                    "Reduce 'Dead Stock' sitting in your godown."
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start">
                                        <div className="mt-1 mr-3 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                            <Zap size={12} className="text-green-600 dark:text-green-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIInventorySection;
