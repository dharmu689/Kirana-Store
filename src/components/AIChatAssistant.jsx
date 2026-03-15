import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Trash2, Loader2 } from 'lucide-react';
import ChatMessage from './ChatMessage';
import SuggestedActions from './SuggestedActions';
import chatService from '../services/chatService';
import VoiceInput from './VoiceInput';

const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your KiranaSmart AI Assistant. How can I help you analyze your business today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (text = input) => {
        if (!text.trim()) return;

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', content: text }];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            const res = await chatService.sendMessage(text);
            setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
        } catch (error) {
            console.error("Chat error", error);
            setMessages([...newMessages, { role: 'assistant', content: "I'm having trouble connecting to the server. Please try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleVoiceResult = (text) => {
        setInput((prev) => prev ? `${prev} ${text}` : text);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setMessages([
            { role: 'assistant', content: 'Chat history cleared. How can I help you today?' }
        ]);
    };

    return (
        <div className="mt-8 flex flex-col items-end w-full max-w-sm ml-auto z-10 relative">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-full bg-white dark:bg-gray-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[450px]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[var(--color-brand-blue)] to-blue-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center space-x-2">
                                <div className="font-bold text-lg tracking-tight bg-white/20 px-2 py-0.5 rounded-lg flex items-center">
                                    <span className="text-white">Kirana</span>
                                    <span className="text-orange-400">Smart</span>
                                    <span className="text-sm font-normal ml-2 opacity-90">AI</span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={clearChat} className="p-1 hover:bg-white/20 rounded transition-colors" title="Clear Chat">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors" title="Close">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 dark:bg-gray-900/50 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                            {messages.map((msg, idx) => (
                                <ChatMessage key={idx} message={msg} />
                            ))}
                            {isTyping && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl p-3 px-4 text-xs flex items-center shadow-sm">
                                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Actions */}
                        <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <SuggestedActions onSelect={handleSendMessage} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-end space-x-2 relative">
                            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl relative border border-transparent focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything — Shift+Enter for new line"
                                    className="w-full bg-transparent text-sm text-gray-800 dark:text-gray-200 px-3 py-3 max-h-32 min-h-[44px] outline-none resize-none hide-scrollbar rounded-xl leading-relaxed"
                                    rows="1"
                                    style={{ height: 'auto' }}
                                />
                            </div>

                            <VoiceInput onResult={handleVoiceResult} isTyping={isTyping} />

                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!input.trim() && !isTyping}
                                className={`p-3 rounded-xl transition-all flex-shrink-0
                                    ${input.trim()
                                        ? 'bg-[var(--color-brand-blue)] text-white hover:bg-blue-600 shadow-md shadow-blue-500/20'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <Send size={20} className={input.trim() ? 'translate-x-[1px] -translate-y-[1px]' : ''} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(59 130 246 / 0.4), 0 8px 10px -6px rgb(59 130 246 / 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="group bg-gradient-to-r from-[var(--color-brand-blue)] to-blue-600 text-white px-6 py-4 rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center justify-center border-2 border-white/20 dark:border-white/10 overflow-hidden relative"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
                    <div className="relative flex items-center gap-3">
                        <MessageSquare size={22} className="animate-pulse" />
                        <span className="font-semibold tracking-wide flex items-center">
                            Ask <span className="font-bold ml-1">Kirana</span><span className="text-orange-300 font-bold">Smart</span> AI
                        </span>
                    </div>
                </motion.button>
            )}
        </div>
    );
};

export default AIChatAssistant;
