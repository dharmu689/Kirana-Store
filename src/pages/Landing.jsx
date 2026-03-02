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
        <div className="min-h-screen bg-gradient-to-br from-[#eef3f9] via-[#f6f8fb] to-[#e9eef6] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-[#1e293b] dark:text-gray-100 font-sans transition-colors duration-300 overflow-x-hidden relative z-0">

            {/* Premium SaaS Background Glow Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                {/* Right side warm orange glow */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 85% 60%, rgba(255,165,90,0.35), transparent 40%)' }} />
                {/* Left bottom soft blue glow */}
                <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 10% 80%, rgba(59,130,246,0.25), transparent 45%)' }} />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <img src="/KiranaSmart.svg" alt="KiranaSmart Logo" className="h-9 md:h-11" />
                        </div>

                        {/* Desktop Navbar */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <a key={link.name} href={link.href} className="text-gray-600 hover:text-[#3b82f6] dark:text-gray-300 dark:hover:text-[#3b82f6] font-medium transition-colors">
                                    {link.name}
                                </a>
                            ))}
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-gray-600 hover:text-[#3b82f6] dark:text-gray-300 dark:hover:text-[#3b82f6] font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:-translate-y-0.5">
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
                            className="md:hidden overflow-hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
                        >
                            <div className="px-4 pt-2 pb-6 space-y-4 shadow-lg">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-[#3b82f6] dark:hover:text-[#3b82f6]"
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
                                        className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-xl shadow-md"
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

            {/* Features Section */}
            <section id="features" className="py-20 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="text-3xl md:text-4xl font-bold mb-4 text-[#1e293b] dark:text-white"
                        >
                            Everything you need to <span className="text-[#3b82f6]">scale</span>.
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
                                whileHover={{ scale: 1.05 }}
                                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-8 rounded-2xl border border-white/40 dark:border-gray-700/50 shadow-xl hover:shadow-[0_10px_30px_rgba(59,130,246,0.15)] dark:hover:shadow-blue-900/20 transition-all duration-300 group"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-[#eef3f9] to-[#fff3eb] dark:from-blue-900/30 dark:to-orange-900/20 text-[#3b82f6] dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:from-[#3b82f6] group-hover:to-[#2563eb] group-hover:text-white transition-all duration-300 shadow-sm border border-[#eef3f9] dark:border-blue-800/20">
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-[#1e293b] dark:text-white drop-shadow-sm">{feature.title}</h3>
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
                <div className="absolute inset-0 bg-[#2563eb] dark:bg-blue-900"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] dark:from-blue-900 dark:to-indigo-950 opacity-90"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight drop-shadow-sm"
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
                        <Link to="/login" className="inline-block px-10 py-4 text-lg font-bold text-[#3b82f6] bg-white rounded-xl shadow-2xl hover:bg-gray-50 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                            Transform Your Store Now
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#f6f8fb]/50 dark:bg-gray-950/50 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-900 py-8 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center gap-2 mb-4 md:mb-0">
                        <span className="text-xl font-bold tracking-tight text-[#3b82f6] dark:text-blue-400">Kirana<span className="text-[#f97316]">Smart</span></span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                        &copy; 2026 KiranaSmart. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
