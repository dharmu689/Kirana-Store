import React from 'react';
import { motion } from 'framer-motion';

const actions = [
    "Sales today",
    "Fast moving products",
    "Slow moving products",
    "Restock suggestions",
    "Category analytics",
    "Forecast demand",
    "Compare this week vs last week",
    "Profit summary",
    "Inventory overview",
    "Expiring products"
];

const SuggestedActions = ({ onSelect }) => {
    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <h4 className="text-xs font-semibold text-gray-500 mb-2 px-1">Suggested Actions</h4>
            <div className="flex space-x-2 px-1">
                {actions.map((action, index) => (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={index}
                        onClick={() => onSelect(action)}
                        className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                    >
                        {action}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default SuggestedActions;
