import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import InputField from '../components/InputField';
import authService from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleInitialized, setGoogleInitialized] = useState(false);

    const clearError = () => error && setError('');

    // Dynamically load Google GSI script
    useEffect(() => {
        const initializeGoogleSignIn = () => {
            if (window.google) {
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
                
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById('googleSignInBtn'),
                    { 
                        theme: 'outline', 
                        size: 'large', 
                        width: '100%', 
                        text: 'continue_with', 
                        shape: 'rectangular',
                        logo_alignment: 'center'
                    }
                );
                setGoogleInitialized(true);
            }
        };

        if (!document.getElementById('google-gsi-client')) {
            const script = document.createElement('script');
            script.id = 'google-gsi-client';
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleSignIn;
            document.body.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }
    }, []);

    // Handle standard username/password submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = new FormData(e.target);
        const email = form.get('email');
        const password = form.get('password');

        if (!email || !password) {
            setError('Please fill in all fields');
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await authService.login({ email, password });
            toast.success('Login Successful');
            navigate('/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || err.toString();
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Handle Google token credential from API
    const handleGoogleCredentialResponse = async (response) => {
        setLoading(true);
        try {
            await authService.googleLogin(response.credential);
            toast.success('Google Login Successful');
            navigate('/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Google Authentication failed';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Developer fallback mock google login
    const handleDevGoogleMock = async () => {
        setLoading(true);
        try {
            // Using our custom developer fallback token structure
            await authService.googleLogin('test-token-dharmu');
            toast.success('Google Login Successful (Developer Fallback)');
            navigate('/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Developer Google Mock login failed';
            setError(errMsg);
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-[#eef2ff] via-[#ffffff] to-[#fff7ed] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

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
                </div>

                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                    Sign in to your account
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
                    Or{' '}
                    <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                        create a new account
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
                            label="Email address"
                            type="email"
                            name="email"
                            onChange={clearError}
                            placeholder="Enter your email"
                            icon={Mail}
                        />

                        <InputField
                            label="Password"
                            type="password"
                            name="password"
                            onChange={clearError}
                            placeholder="Enter your password"
                            icon={Lock}
                        />

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded transition-colors"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-300 font-medium">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                    Forgot password?
                                </Link>
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
                                    <LogIn className="mr-2" size={18} />
                                )}
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    {/* Google Login Section */}
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

                        {/* Google GSI Render Target */}
                        <div className="flex flex-col gap-3">
                            <div id="googleSignInBtn" className="w-full"></div>
                            
                            {/* Dev mock login button */}
                            <button
                                type="button"
                                onClick={handleDevGoogleMock}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-all duration-200"
                            >
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 15.01 1 12 1 7.24 1 3.21 3.73 1.29 7.71l3.86 3C6.07 7.78 8.78 5.04 12 5.04z" />
                                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.45h6.45c-.28 1.48-1.11 2.73-2.36 3.58l3.66 2.84c2.14-1.97 3.38-4.87 3.38-8.53z" />
                                    <path fill="#FBBC05" d="M5.15 10.71c-.24-.71-.38-1.48-.38-2.27s.14-1.56.38-2.27L1.29 3.17C.47 4.87 0 6.78 0 8.8s.47 3.93 1.29 5.63l3.86-3.03v.31z" />
                                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.31 1.09-4.3 1.09-3.22 0-5.93-2.74-6.85-5.67l-3.86 3C3.21 20.27 7.24 23 12 23z" />
                                </svg>
                                <span>Continue with Google (Local Demo)</span>
                            </button>
                        </div>
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

export default Login;
