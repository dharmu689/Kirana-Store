import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Mic, Trash2, Loader2, MicOff } from 'lucide-react';
import ChatMessage from './ChatMessage';
import SuggestedActions from './SuggestedActions';
import chatService from '../services/chatService';

const AIChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your KiranaSmart AI Assistant. How can I help you analyze your business today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Setup Web Speech API Request
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListen = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (e) {
                    console.error(e);
                }
            } else {
                alert("Speech recognition isn't supported in this browser.");
            }
        }
    };

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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[500px] max-h-[80vh]"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[var(--color-brand-blue)] to-blue-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center space-x-2">
                                <MessageSquare size={20} />
                                <h3 className="font-bold text-sm tracking-wide">AI Assistant</h3>
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

                            <button
                                onClick={toggleListen}
                                className={`p-3 rounded-xl transition-colors flex-shrink-0 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-500'}`}
                                title={isListening ? "Stop listening" : "Voice input"}
                            >
                                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>

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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-[var(--color-brand-blue)] text-white p-4 rounded-full shadow-xl shadow-blue-500/30 hover:bg-blue-600 transition-colors flex items-center justify-center border-4 border-white dark:border-gray-900"
                >
                    <MessageSquare size={24} />
                </motion.button>
            )}
        </div>
    );
};

export default AIChatAssistant;
