import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
    return (
        <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 text-[#1e293b] dark:text-white drop-shadow-sm">
                    Modernize Your <span className="text-[#f97316]">Kirana</span>, <br className="hidden md:block" />
                    Supercharge Your Sales
                </h1>
                <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
                    The all-in-one smart inventory and sales platform built specifically for modern Kirana stores. Manage stock, forecast demand, and increase profits effortlessly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                    <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center">
                        Get Started <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                    <a href="#features" className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center">
                        Learn More
                    </a>
                </div>
            </motion.div>
        </section>
    );
};

export default HeroSection;
