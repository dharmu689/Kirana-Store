import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const GoogleAuthButton = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const isClientConfigured = clientId && clientId !== 'YOUR_GOOGLE_CLIENT_ID' && clientId.trim() !== '';

    useEffect(() => {
        if (!isClientConfigured) return;

        const initializeGoogleSignIn = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleGoogleCredentialResponse,
                });

                window.google.accounts.id.renderButton(
                    document.getElementById('googleSignInBtn'),
                    { 
                        theme: 'outline', 
                        size: 'large', 
                        width: '320', // Width in pixels for centered rendering
                        text: 'continue_with', 
                        shape: 'rectangular',
                        logo_alignment: 'left'
                    }
                );
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
    }, [isClientConfigured]);

    const processGoogleAuth = async (idToken) => {
        setLoading(true);
        const toastId = toast.loading('Signing in...');
        try {
            const response = await authService.googleLogin(idToken);
            
            // Show successful message and morph toast
            if (response.isNewUser) {
                toast.success('Account Created Successfully', { id: toastId });
            } else {
                toast.success('Welcome Back', { id: toastId });
            }
            
            navigate('/dashboard');
        } catch (err) {
            const errMsg = err.response?.data?.message || 'Authentication Failed';
            toast.error(errMsg, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCredentialResponse = async (response) => {
        if (response.credential) {
            await processGoogleAuth(response.credential);
        }
    };

    return (
        <div className="w-full relative mt-4 flex justify-center">
            {/* Loading / Authenticating Glassmorphism Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-20 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm backdrop-blur-[1px] pointer-events-none">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Authenticating...</span>
                </div>
            )}

            {isClientConfigured ? (
                // Official GSI Render Target
                <div id="googleSignInBtn" className="w-full flex justify-center min-h-[44px]" style={{ opacity: loading ? 0.3 : 1 }}></div>
            ) : (
                // Safe Fallback messaging for configuration gaps
                <div className="text-xs text-red-500 font-semibold border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900 p-3 rounded-xl w-full text-center">
                    Google Sign-In is not configured. Please check VITE_GOOGLE_CLIENT_ID.
                </div>
            )}
        </div>
    );
};

export default GoogleAuthButton;
