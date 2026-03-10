import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

// Eagerly Load Above-The-Fold Sections
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import AIInventorySection from '../components/landing/AIInventorySection';
import BarcodePOSSection from '../components/landing/BarcodePOSSection';

// Lazily Load Below-The-Fold Sections
const TestimonialsSection = lazy(() => import('../components/landing/TestimonialsSection'));
const CallToActionSection = lazy(() => import('../components/landing/CallToActionSection'));
const FooterSection = lazy(() => import('../components/landing/FooterSection'));

// Simple Skeleton for Lazy Modules
const SectionFallback = () => (
    <div className="w-full h-64 bg-gray-50/50 dark:bg-gray-900/50 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
    </div>
);

const Landing = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eef4ff] via-[#f7f9fc] to-[#fff7ed] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-[#1e293b] dark:text-gray-100 font-sans transition-colors duration-300 overflow-x-hidden relative z-0">

            {/* Performance Optimized Static Background Effects (Replacing continuously running Framer loops) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                {/* Subtle Noise Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Static Center Highlight */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.6),transparent_60%)] dark:bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.2),transparent_60%)]" />

                {/* Static Blobs replacing heavy Framer CPU looping */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-blue-500/20 dark:bg-blue-600/10" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[120px] bg-orange-500/20 dark:bg-orange-600/10" />
                <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-500/10 dark:bg-purple-600/5" />
            </div>

            {/* Navbar */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <img src="/KiranaSmart.svg" alt="KiranaSmart Logo" className="h-11 md:h-14" />
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

            {/* Modular Landing Application */}
            <HeroSection />
            <FeaturesSection />
            <AIInventorySection />
            <BarcodePOSSection />

            {/* Suspense Wrappers for Below The Fold Content to speed up Initial Display */}
            <Suspense fallback={<SectionFallback />}>
                <TestimonialsSection />
                <CallToActionSection />
                <FooterSection />
            </Suspense>

        </div>
    );
};

export default Landing;
