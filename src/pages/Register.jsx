import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import InputField from '../components/InputField';
import authService from '../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'staff',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { name, email, password, confirmPassword, role } = formData;

    const handleChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authService.register({ name, email, password, role });
            navigate('/dashboard');
        } catch (err) {
            const message =
                (err.response && err.response.data && err.response.data.message) ||
                err.message ||
                err.toString();
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#ffffff] to-[#fff7ed] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-gradient-move bg-[length:400%_400%]">

            {/* Floating Background Blobs */}
            <div className="absolute top-20 left-10 md:left-20 w-72 h-72 bg-blue-400 rounded-full blur-[120px] opacity-40 animate-pulse pointer-events-none"></div>
            <div className="absolute bottom-10 right-10 md:right-20 w-72 h-72 bg-orange-400 rounded-full blur-[120px] opacity-30 animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-[420px] w-[90%] mx-auto z-10 relative">
                <div className="flex flex-col items-center mb-6 z-10 relative">
                    <img
                        src="/KSfavicon.svg"
                        alt="KiranaSmart Logo"
                        className="w-20 h-auto mb-3"
                    />
                    {/* <h1 className="text-2xl font-bold">
                        <span className="text-blue-600">Kirana</span>
                        <span className="text-orange-500">Smart</span>
                    </h1> */}
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
                    className="bg-white border border-gray-200 py-8 px-4 sm:px-10 shadow-xl rounded-3xl"
                >
                    {error && (
                        <div className="mb-6 bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 rounded-xl flex items-start shadow-sm">
                            <AlertCircle className="text-red-500 mr-2 mt-0.5" size={18} />
                            <p className="text-sm text-red-700 font-medium">{error}</p>
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

                        <div className="grid grid-cols-2 gap-4">
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
                                    className="block w-full h-12 pl-10 pr-10 rounded-lg border border-gray-300 bg-gray-100 text-gray-900 placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none"
                                >
                                    {/* <option value="staff">Staff Member</option> */}
                                    <option value="admin">Store Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
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
                                    <UserPlus className="mr-2" size={18} />
                                )}
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
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
