import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceInput = ({ onResult, isTyping }) => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            // Configured for Hindi/English/Hinglish recognition
            recognitionRef.current.lang = 'hi-IN';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                onResult(transcript);
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
    }, [onResult]);

    const toggleListen = () => {
        if (isTyping) return;

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

    return (
        <button
            onClick={toggleListen}
            disabled={isTyping}
            className={`p-3 rounded-xl transition-colors flex-shrink-0 ${isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : isTyping
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-blue-500'
                }`}
            title={isListening ? "Stop listening" : "Voice input (Hindi/English)"}
        >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
    );
};

export default VoiceInput;
