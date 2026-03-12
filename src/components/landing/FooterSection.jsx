import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    Facebook, 
    Twitter, 
    Instagram, 
    Linkedin, 
    Mail, 
    Phone, 
    MapPin, 
    ArrowRight 
} from 'lucide-react';

const FooterSection = () => {
    const currentYear = new Date().getFullYear();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <footer className="relative bg-[#0f172a] text-gray-300 pt-20 pb-10 overflow-hidden z-10">
            {/* Background Glow Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Top Border Gradient */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16"
                >
                    {/* Brand Column */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold tracking-tight text-white">
                                Kirana<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Smart</span>
                            </span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Empowering local retailers with AI-driven inventory management, smart POS, and automated vendor reordering.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a key={index} href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] hover:-translate-y-1">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Quick Links
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            {['Features', 'Pricing', 'Testimonials', 'About Us', 'Contact'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="group flex items-center text-gray-400 hover:text-white transition-colors duration-200">
                                        <ArrowRight size={16} className="text-blue-500 mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Legal */}
                    <motion.div variants={itemVariants}>
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Legal
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-orange-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Data Security'].map((item) => (
                                <li key={item}>
                                    <a href="#" className="text-gray-400 hover:text-white hover:underline decoration-blue-500 underline-offset-4 transition-all duration-200">
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
                            Contact Us
                            <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <MapPin className="text-blue-500 mt-1 mr-3 flex-shrink-0" size={20} />
                                <span className="text-gray-400">123 Market Street, Kirana Plaza,<br/>Mumbai, India 400001</span>
                            </div>
                            <div className="flex items-center">
                                <Phone className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                                <span className="text-gray-400">+91 98765 43210</span>
                            </div>
                            <div className="flex items-center">
                                <Mail className="text-blue-500 mr-3 flex-shrink-0" size={20} />
                                <span className="text-gray-400">support@kiranasmart.in</span>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        &copy; {currentYear} KiranaSmart Technologies. All rights reserved.
                    </p>
                    <p className="text-gray-500 text-sm flex items-center gap-1">
                        Made with <span className="text-red-500 animate-pulse">❤️</span> for local businesses
                    </p>
                </motion.div>
            </div>
        </footer>
    );
};

export default FooterSection;
