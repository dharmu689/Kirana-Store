import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, BarChart3, Users, LineChart, PieChart, Menu, X, ArrowRight } from 'lucide-react';

const Landing = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
    ];

    const features = [
        {
            title: 'Smart Inventory',
            description: 'Automate stock tracking and receive low-stock alerts instantly.',
            icon: Package,
        },
        {
            title: 'Sales Tracking',
            description: 'Monitor daily, weekly, and monthly sales with intuitive dashboards.',
            icon: TrendingUp,
        },
        {
            title: 'Profit Analytics',
            description: 'Analyze your margins and identify your most profitable products.',
            icon: BarChart3,
        },
        {
            title: 'Vendor Management',
            description: 'Streamline reordering and keep vendor contacts in one place.',
            icon: Users,
        },
        {
            title: 'Forecasting',
            description: 'Predict future demand based on historical sales trends.',
            icon: LineChart,
        },
        {
            title: 'Growth Insights',
            description: 'Get actionable data to expand your Kirana business efficiently.',
            icon: PieChart,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 overflow-x-hidden relative">

            {/* Background Graphic Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[100px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-orange-400/20 dark:bg-orange-600/20 blur-[100px]" />
                <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-purple-400/20 dark:bg-purple-600/20 blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <img src="/KiranaSmart.svg" alt="KiranaSmart Logo" className="h-8 md:h-10" />
                        </div>

                        {/* Desktop Navbar */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-blue-500/50 hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={toggleMenu}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navbar Dropdown */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="md:hidden overflow-hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-4 shadow-lg">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-2 space-y-3">
                                    <Link
                                        to="/login"
                                        className="block w-full text-center px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-md"
                                    >
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
                        Modernize Your Kirana, <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">Supercharge Your Sales</span>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-10">
                        The all-in-one smart inventory and sales platform built specifically for modern Kirana stores. Manage stock, forecast demand, and increase profits effortlessly.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                        <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1 flex items-center justify-center">
                            Get Started <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <a href="#features" className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center">
                            Learn More
                        </a>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-800/50 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl md:text-4xl font-bold mb-4"
                        >
                            Everything you need to <span className="text-blue-600 dark:text-blue-400">scale</span>.
                        </motion.h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                            Powerful tools combining point-of-sale ease with enterprise-level analytics.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700/50 shadow-xl shadow-gray-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 opacity-90"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight"
                    >
                        Start Managing Your Store Smarter Today
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-blue-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto"
                    >
                        Join thousands of Kirana owners who have transformed their businesses with KiranaSmart.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link to="/login" className="inline-block px-10 py-4 text-lg font-bold text-blue-600 bg-white rounded-2xl shadow-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-300">
                            Transform Your Store Now
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <span className=" text-blue-600 dark:text-blue-400">Kirana<span className="text-orange-600">Smart</span></span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        &copy; 2026 KiranaSmart. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
