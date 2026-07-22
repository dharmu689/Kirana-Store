import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, Check, X, ShieldCheck, ArrowLeft, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import InputField from '../components/InputField';
import authService from '../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    
    // OTP Entry
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const otpRefs = useRef([]);

    // New Password Entry
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // Password Complexity Checks
    const [checks, setChecks] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    // Run password validation checks on type
    useEffect(() => {
        setChecks({
            length: newPassword.length >= 8,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            number: /[0-9]/.test(newPassword),
            special: /[!@#$%^&*]/.test(newPassword)
        });
    }, [newPassword]);

    const isPasswordStrong = Object.values(checks).every(Boolean);

    // Resend OTP Timer
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Handle OTP digits input
    const handleOtpChange = (val, index) => {
        if (isNaN(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val !== '' && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                otpRefs.current[index - 1].focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        }
    };

    // Step 1: Submit Email
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await authService.forgotPassword(email);
            toast.success('Reset OTP code sent to your email');
            setStep(2);
            setTimer(60);
            setCanResend(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to request reset OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Submit OTP
    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length < 6) {
            toast.error('Please enter the complete 6-digit OTP code');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyResetOtp(email, fullOtp);
            toast.success('OTP code verified');
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired OTP code');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        if (!canResend) return;
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            toast.success('A new OTP has been sent successfully');
            setTimer(60);
            setCanResend(false);
            setOtp(new Array(6).fill(''));
            otpRefs.current[0].focus();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Submit Reset Password
    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!isPasswordStrong) {
            toast.error('Password is too weak. Please meet all criteria.');
            return;
        }

        setLoading(true);
        try {
            const fullOtp = otp.join('');
            await authService.resetPassword(email, fullOtp, newPassword, confirmPassword);
            toast.success('Password Updated Successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Wizard animations
    const slideVariants = {
        enter: { opacity: 0, x: 50 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 }
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
                    Reset Password
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Follow the steps to recover your account access.
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 py-8 px-4 sm:px-10 shadow-xl rounded-3xl"
                >
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <form className="space-y-5" onSubmit={handleEmailSubmit}>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                                        Enter your email address and we'll send you a 6-digit OTP code to verify your request.
                                    </div>

                                    <InputField
                                        label="Email address"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        icon={Mail}
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-lg focus:outline-none transition-all duration-200 disabled:opacity-75"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        ) : (
                                            <KeyRound className="mr-2" size={18} />
                                        )}
                                        {loading ? 'Sending OTP...' : 'Send OTP Code'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <form className="space-y-5" onSubmit={handleOtpSubmit}>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                                        We sent a verification OTP code to:<br/>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
                                    </div>

                                    <div className="flex flex-col items-center justify-center">
                                        <div className="flex gap-2 justify-between w-full max-w-sm">
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    type="text"
                                                    maxLength="1"
                                                    value={digit}
                                                    ref={(el) => (otpRefs.current[idx] = el)}
                                                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                                                    className="w-12 h-14 text-center font-bold text-xl rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white shadow-sm"
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-lg focus:outline-none transition-all duration-200 disabled:opacity-75"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        ) : (
                                            <ShieldCheck className="mr-2" size={18} />
                                        )}
                                        {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
                                    </button>

                                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2 flex justify-center items-center gap-1.5">
                                        Didn't get code?{' '}
                                        {canResend ? (
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                className="font-bold text-blue-600 hover:text-blue-500"
                                            >
                                                Resend
                                            </button>
                                        ) : (
                                            <span>Resend in {timer}s</span>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <form className="space-y-4" onSubmit={handleResetSubmit}>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center font-medium">
                                        Create a new secure password for your account.
                                    </div>

                                    {/* Password Input */}
                                    <div className="relative">
                                        <InputField
                                            label="New Password"
                                            type={showPass ? 'text' : 'password'}
                                            name="newPassword"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            icon={Lock}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(!showPass)}
                                            className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        >
                                            {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Confirm Password Input */}
                                    <div className="relative">
                                        <InputField
                                            label="Confirm Password"
                                            type={showConfirmPass ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            icon={Lock}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                        >
                                            {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>

                                    {/* Confirm match message */}
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                                            <X size={14} /> Passwords do not match.
                                        </p>
                                    )}

                                    {confirmPassword && newPassword === confirmPassword && (
                                        <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                                            <Check size={14} /> Passwords match.
                                        </p>
                                    )}

                                    {/* Live Strength Checklist */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl text-xs space-y-1.5 border border-gray-100 dark:border-gray-700">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Password Strength Criteria:</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                                            <div className={`flex items-center gap-1.5 font-medium ${checks.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                                {checks.length ? <Check size={14} className="stroke-[3]" /> : <span className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full inline-block"></span>}
                                                8+ characters
                                            </div>
                                            <div className={`flex items-center gap-1.5 font-medium ${checks.uppercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                                {checks.uppercase ? <Check size={14} className="stroke-[3]" /> : <span className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full inline-block"></span>}
                                                Uppercase letter
                                            </div>
                                            <div className={`flex items-center gap-1.5 font-medium ${checks.lowercase ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                                {checks.lowercase ? <Check size={14} className="stroke-[3]" /> : <span className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full inline-block"></span>}
                                                Lowercase letter
                                            </div>
                                            <div className={`flex items-center gap-1.5 font-medium ${checks.number ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                                {checks.number ? <Check size={14} className="stroke-[3]" /> : <span className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full inline-block"></span>}
                                                Number (0-9)
                                            </div>
                                            <div className={`flex items-center gap-1.5 font-medium ${checks.special ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                                                {checks.special ? <Check size={14} className="stroke-[3]" /> : <span className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full inline-block"></span>}
                                                Special (!@#$%^&*)
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !isPasswordStrong || newPassword !== confirmPassword}
                                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-lg focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        ) : (
                                            <ShieldCheck className="mr-2" size={18} />
                                        )}
                                        {loading ? 'Updating Password...' : 'Reset Password'}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 text-center border-t border-gray-100 dark:border-gray-700 pt-5">
                        <Link
                            to="/login"
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium inline-flex items-center gap-1 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ForgotPassword;
