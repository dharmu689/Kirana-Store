import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const VerifyOtp = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const isReset = searchParams.get('reset') === 'true';

    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Timer countdown for resending OTP
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    // Handle input change
    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        const val = element.value;
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        // Auto focus next input
        if (val !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle backspace or left/right arrow navigation
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                // Focus previous input and clear it
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1].focus();
            } else {
                // Just clear current
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Paste handling for full 6 digit OTPs
    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').trim();
        if (data.length === 6 && /^\d+$/.test(data)) {
            const pasteOtp = data.split('');
            setOtp(pasteOtp);
            inputRefs.current[5].focus();
        }
    };

    // Submit Verification
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length < 6) {
            toast.error('Please enter the complete 6-digit OTP code');
            return;
        }

        setLoading(true);
        try {
            if (isReset) {
                // If it's forgot password flow verify-reset-otp
                await authService.verifyResetOtp(email, fullOtp);
                toast.success('OTP Verified Successfully');
                // Redirect to reset password page with email and verified OTP as query params
                navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${fullOtp}`);
            } else {
                // Standard registration email verification
                await authService.verifyOtp(email, fullOtp);
                toast.success('Email Verified successfully! Please log in.');
                navigate('/login');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend verification email
    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        try {
            if (isReset) {
                // Resend for forgot password
                await authService.forgotPassword(email);
            } else {
                // Resend for verification
                await authService.resendOtp(email);
            }
            toast.success('A new OTP has been sent successfully');
            setTimer(60);
            setCanResend(false);
            setOtp(new Array(6).fill(''));
            inputRefs.current[0].focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#ffffff] to-[#fff7ed] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Floating Background Blobs */}
            <div className="absolute top-20 left-10 md:left-20 w-72 h-72 bg-blue-400 rounded-full blur-[120px] opacity-40 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 md:right-20 w-72 h-72 bg-orange-400 rounded-full blur-[120px] opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-[440px] w-[90%] mx-auto z-10 relative">
                <div className="flex flex-col items-center mb-6 z-10 relative">
                    <img
                        src="/KSfavicon.svg"
                        alt="KiranaSmart Logo"
                        className="w-20 h-auto mb-3"
                    />
                </div>

                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                    Verify your email
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8 flex items-center justify-center gap-1.5">
                    <Mail size={16} className="text-blue-500" />
                    Sent to: <span className="font-semibold text-gray-800 dark:text-gray-200">{email || 'your email'}</span>
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 py-8 px-4 sm:px-10 shadow-xl rounded-3xl"
                >
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center justify-center">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
                                Enter the 6-digit verification code
                            </label>
                            
                            <div className="flex gap-2 sm:gap-3 justify-between w-full max-w-sm" onPaste={handlePaste}>
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        ref={(el) => (inputRefs.current[idx] = el)}
                                        onChange={(e) => handleChange(e.target, idx)}
                                        onKeyDown={(e) => handleKeyDown(e, idx)}
                                        className="w-12 h-14 text-center font-bold text-xl sm:text-2xl rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 shadow-sm"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <ShieldCheck className="mr-2" size={18} />
                                )}
                                {loading ? 'Verifying...' : 'Verify Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm border-t border-gray-100 dark:border-gray-700 pt-5">
                        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            Didn't receive the email?{' '}
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={loading}
                                    className="font-bold text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1 focus:outline-none disabled:opacity-50"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                    Resend Code
                                </button>
                            ) : (
                                <span className="font-semibold text-gray-700 dark:text-gray-300">
                                    Resend in {timer}s
                                </span>
                            )}
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </button>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                    &copy; 2026 KiranaSmart. All rights reserved.
                </div>
            </div>
        </div>
    );
};

export default VerifyOtp;
