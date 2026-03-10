import React from 'react';
import { motion } from 'framer-motion';
import { Package, TrendingUp, BarChart3, Users, LineChart, PieChart } from 'lucide-react';

const FeaturesSection = () => {
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
        <section id="features" className="py-20 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
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
                            viewport={{ once: true, margin: "-50px" }}
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
    );
};

export default FeaturesSection;
