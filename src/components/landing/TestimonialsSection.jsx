import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            quote: "KiranaSmart completely changed how I run my shop. The low stock alerts saved me from losing customers to the store next door.",
            author: "Dheeraj Kumar",
            role: "Owner, Rajesh Provisions"
        },
        {
            quote: "I used to spend 3 hours a day tracking ledger books and vendor orders. Now, my invoices are generated automatically. This is a game-changer.",
            author: "Sujeet Kumar",
            role: "Manager, Sharma Supermarket"
        },
        {
            quote: "The visual profit charts and barcode POS helped me understand exactly which biscuits and snacks are making me the most money.",
            author: "Vikram Singh",
            role: "Proprietor, Singh Daily Needs"
        }
    ];

    return (
        <section className="py-24 bg-white dark:bg-gray-900 relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-3xl md:text-4xl font-bold mb-4 text-[#1e293b] dark:text-white"
                    >
                        Loved by store owners across India.
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50 relative"
                        >
                            <Quote className="text-blue-200 dark:text-blue-900 absolute top-6 right-6 w-12 h-12" />
                            <p className="text-gray-600 dark:text-gray-300 relative z-10 mb-6 font-medium italic">
                                "{test.quote}"
                            </p>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">{test.author}</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{test.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
