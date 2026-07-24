import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Briefcase, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import InputField from '../components/InputField';
import authService from '../services/authService';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'admin', // Default to admin for full store owner rights
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Complexity Checks
    const [checks, setChecks] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const { name, email, password, confirmPassword, role } = formData;

    // Run password validation checks on type
    useEffect(() => {
        setChecks({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        });
    }, [password]);

    const isPasswordStrong = Object.values(checks).every(Boolean);

    const handleChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        if (error) setError('');
    };

    // Standard Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            toast.error('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            toast.error('Passwords do not match');
            return;
        }

        if (!isPasswordStrong) {
            setError('Password does not meet complexity requirements');
            toast.error('Password is too weak');
            return;
        }

        setLoading(true);
        try {
            await authService.register({ name, email, password, role });
            toast.success('Registration Successful. OTP Sent.');
            // Redirect to OTP verification page with email query param
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } catch (err) {
            const message = err.response?.data?.message || err.message || err.toString();
            setError(message);
            toast.error(message);
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
                    Create account
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        Sign in
                    </Link>
                </p>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="bg-white dark:bg-gray-800 dark:border-gray-700 border border-gray-200 py-8 px-4 sm:px-10 shadow-xl rounded-3xl"
                >
                    {error && (
                        <div className="mb-6 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-xl flex items-start shadow-sm">
                            <AlertCircle className="text-red-500 mr-2 mt-0.5 shrink-0" size={18} />
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <InputField
                            label="Full Name"
                            type="text"
                            name="name"
                            value={name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            icon={User}
                        />

                        <InputField
                            label="Email address"
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            icon={Mail}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                                label="Password"
                                type="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                placeholder="******"
                                icon={Lock}
                            />

                            <InputField
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                                placeholder="******"
                                icon={Lock}
                            />
                        </div>

                        {/* Passwords Do Not Match Warnings */}
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-1">
                                <X size={14} /> Passwords do not match.
                            </p>
                        )}

                        {confirmPassword && password === confirmPassword && (
                            <p className="text-xs text-green-600 font-semibold flex items-center gap-1 mt-1">
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

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Role
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Briefcase size={18} />
                                </div>
                                <select
                                    name="role"
                                    value={role}
                                    onChange={handleChange}
                                    className="block w-full h-12 pl-10 pr-10 rounded-lg border border-gray-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
                                >
                                    <option value="admin">Store Admin</option>
                                    <option value="staff">Staff Member</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !isPasswordStrong || password !== confirmPassword}
                                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    <UserPlus className="mr-2" size={18} />
                                )}
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    {/* Google Sign Up Section */}
                    <div className="mt-6">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <GoogleAuthButton />
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

export default Register;
