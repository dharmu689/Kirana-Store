import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CallToActionSection = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#2563eb] dark:bg-blue-900"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] dark:from-blue-900 dark:to-indigo-950 opacity-90"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-sm"
                >
                    Start Managing Your Store Smarter Today
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: 0.1 }}
                    className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
                >
                    Join thousands of Kirana owners who have transformed their businesses with KiranaSmart.
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: 0.2 }}
                >
                    <Link to="/login" className="inline-block px-10 py-4 text-lg font-bold text-[#3b82f6] bg-white rounded-xl shadow-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                        Transform Your Store Now
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToActionSection;
