import React from 'react';
import { Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatMessage = ({ message }) => {
    const isBot = message.role === 'assistant';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}
        >
            <div className={`flex max-w-[85%] ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-blue-100 dark:bg-blue-900/50 mr-3' : 'bg-green-100 dark:bg-green-900/50 ml-3'}`}>
                    {isBot ? <Bot size={16} className="text-blue-600 dark:text-blue-400" /> : <User size={16} className="text-green-600 dark:text-green-400" />}
                </div>

                {/* Bubble */}
                <div className={`px-4 py-3 rounded-2xl text-sm ${isBot
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                    : 'bg-blue-600 text-white rounded-tr-none'
                    }`}>
                    {message.content}
                </div>
            </div>
        </motion.div>
    );
};

export default ChatMessage;
