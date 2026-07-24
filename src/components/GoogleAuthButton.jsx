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

    // Handle incoming message events for local development popup fallback
    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'MOCK_GOOGLE_AUTH_SUCCESS') {
                const idToken = event.data.idToken;
                await processGoogleAuth(idToken);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

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

    const handleCustomPopupClick = () => {
        if (loading) return;
        
        // Open the custom mock Google Chooser popup window centered
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        window.open(
            '/dev-google-login.html',
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
        );
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
                // Premium Styled Custom React Button for Dev fallback (looks identical to Google GSI continue_with)
                <button
                    type="button"
                    onClick={handleCustomPopupClick}
                    disabled={loading}
                    className="w-full max-w-[320px] flex items-center justify-center gap-3 h-11 px-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                </button>
            )}
        </div>
    );
};

export default GoogleAuthButton;
