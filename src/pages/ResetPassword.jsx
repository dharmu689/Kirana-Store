import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowLeft, Check, X, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import InputField from '../components/InputField';
import authService from '../services/authService';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const otp = searchParams.get('otp') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e) => {
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
            toast.error('Password does not meet complexity requirements');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(email, otp, newPassword, confirmPassword);
            toast.success('Password Updated Successfully');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Password update failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#ffffff] to-[#fff7ed] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-gradient-move bg-[length:400%_400%]">
            
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
                    Create New Password
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Resetting password for: <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 py-8 px-4 sm:px-10 shadow-xl rounded-3xl"
                >
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <InputField
                            label="New Password"
                            type="password"
                            name="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            icon={Lock}
                        />

                        <InputField
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            icon={Lock}
                        />

                        {/* Passwords Do Not Match Warnings */}
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

                        {/* Live Password checklist */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl text-xs space-y-1.5 border border-gray-100 dark:border-gray-700">
                            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Password Strength Criteria:</p>
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

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isPasswordStrong || newPassword !== confirmPassword}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                ) : (
                                    <ShieldCheck className="mr-2" size={18} />
                                )}
                                {loading ? 'Saving Password...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>

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

export default ResetPassword;
