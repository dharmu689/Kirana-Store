# AUTH_CODEBASE_REPORT

## 1. Summary
* **MERN Authentication Context**: The application currently implements custom authentication with email, password, and email-based One-Time Passwords (OTP).
* **Pre-configured Google OAuth Endpoint**: A backend route `/api/auth/google-login` and corresponding passport logic already exist, indicating prior preparation for Google Sign-In.
* **Custom Passport Verification**: The backend uses Passport.js with a custom verification strategy (`passport-custom`) that interacts with `google-auth-library` to parse and verify the client-provided `idToken`.
* **In-Memory Hybrid Development Mode**: If the MongoDB connection fails on startup, the backend falls back to an in-memory database mode utilizing a JS `Map` object (`mockUsers`). Authentication controllers and middlewares support both MongoDB and this hybrid mode.
* **Dev Mock Google Popup**: For development environments without `VITE_GOOGLE_CLIENT_ID` defined, the frontend falls back to launching a custom-styled popup (`/dev-google-login.html`). This popup sends a mock token post-message back to the opener, allowing local testing without real credentials.
* **No Password Enforcement**: At the Mongoose schema level, the `password` field is not required. A pre-save mongoose middleware handles hashing, and it safely skips execution if no password is provided.
* **Separate Domain Deployments**: The frontend is deployed on Vercel (`https://kirana-store-oq3u.vercel.app`) and the backend is deployed on Render (`https://kirana-store-2ykl.onrender.com`). Cookies are not used for JWT; the client stores the token in `localStorage` under the `"user"` key and appends it via an Axios authorization header interceptor. CORS is configured on the backend to allow credentials and handle requests from the Vercel production origin.

---

## 2. Existing Auth System

### Mongoose User Schema
* File path: [User.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/models/User.js)
* The `password` field is optional (not required) at the schema level.
* The pre-save hook handles hashing only if a password is present and modified.

```javascript
// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            // Password not required for Google authenticated users
        },
        role: {
            type: String,
            enum: ['admin', 'staff'],
            default: 'staff',
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
        },
        otpExpires: {
            type: Date,
        },
        googleId: {
            type: String,
            unique: true,
            sparse: true,
        },
        provider: {
            type: String,
            default: 'local',
        },
        profileImage: {
            type: String,
        },
        loginAttempts: {
            type: Number,
            default: 0,
        },
        lockUntil: {
            type: Date,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password') || !this.password) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Authentication Middleware
* File path: [authMiddleware.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/middleware/authMiddleware.js)
* Standard Bearer Token extraction from the `Authorization` header.
* Hybrid check: If database is disconnected (`mongoose.connection.readyState !== 1`), it searches the in-memory `mockUsers` Map. Otherwise, it queries the MongoDB database.

```javascript
// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_local_dev_jwt_secret_key_12345');
        
        if (mongoose.connection.readyState !== 1) {
            // Retrieve in-memory user map
            const { mockUsers } = require('../controllers/authController');
            let foundUser = null;

            for (const [email, u] of mockUsers.entries()) {
                if (u._id === decoded.id) {
                    foundUser = { ...u };
                    delete foundUser.password; // Do not send password
                    break;
                }
            }

            if (!foundUser) {
                return res.status(401).json({ message: 'Not authorized, mock user not found' });
            }

            req.user = foundUser;
        } else {
            req.user = await User.findById(decoded.id).select('-password');
        }

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth Middleware Verification Error:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
```

### Axios Client Configuration
* File path: [axiosConfig.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/src/utils/axiosConfig.js)
* Extracts the token from `localStorage` under the `"user"` key and appends it to outbound requests.
* Intercepts `401` errors, clears the token store, and redirects to `/login` if on a private route.

```javascript
// src/utils/axiosConfig.js
import axios from "axios";

let baseURL = import.meta.env.VITE_API_URL || "https://kirana-store-2ykl.onrender.com";
if (baseURL && !baseURL.endsWith('/api')) {
    baseURL += '/api';
}

const API = axios.create({
    baseURL,
});

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

// Response interceptor to handle 401 errors globally
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("user");
            const publicPaths = ["/", "/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"];
            if (!publicPaths.includes(window.location.pathname)) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default API;
```

### Frontend Auth Service
* File path: [authService.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/src/services/authService.js)
* Encapsulates auth API requests, including `login`, `register`, OTP operations, `googleLogin`, `logout`, and token getters.

```javascript
// src/services/authService.js
import API from "../utils/axiosConfig";

// Register user (requires verification, so we don't save token yet)
const register = async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await API.post("/auth/login", userData);

    if (response.data && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Verify email OTP
const verifyOtp = async (email, otp) => {
    const response = await API.post("/auth/verify-otp", { email, otp });
    return response.data;
};

// Resend verification OTP
const resendOtp = async (email) => {
    const response = await API.post("/auth/resend-otp", { email });
    return response.data;
};

// Request Forgot Password OTP
const forgotPassword = async (email) => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
};

// Verify Reset OTP
const verifyResetOtp = async (email, otp) => {
    const response = await API.post("/auth/verify-reset-otp", { email, otp });
    return response.data;
};

// Reset Password
const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    const response = await API.post("/auth/reset-password", { email, otp, newPassword, confirmPassword });
    return response.data;
};

// Google OAuth Login
const googleLogin = async (idToken) => {
    const response = await API.post("/auth/google-login", { idToken });

    if (response.data && response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem("user");
};

// Get current user
const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem("user"));
};

// Get profile
const getProfile = async () => {
    const response = await API.get("/auth/profile");
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    getProfile,
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    googleLogin,
};

export default authService;
```

---

## 3. Google OAuth Remnants

### Google Passport Configuration
* File path: [passport.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/config/passport.js)
* Uses a custom strategy to verify the `idToken`. If the server is in development mode and `GOOGLE_CLIENT_ID` is not configured, it intercepts mock tokens (`test-token-...` or `development-test-token`) and logs the user in with dummy profile parameters.
* In production, it verifies the client ID token against Google's OAuth2 endpoints using `google-auth-library`.

```javascript
// server/config/passport.js
const passport = require('passport');
const CustomStrategy = require('passport-custom').Strategy;
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

passport.use('google-id-token', new CustomStrategy(
    async function(req, done) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return done(null, false, { message: 'No Google idToken provided' });
            }

            const isDev = process.env.NODE_ENV !== 'production';

            // Developer fallback for testing locally when GOOGLE_CLIENT_ID is not configured (disabled in production)
            if (isDev && (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') && idToken.startsWith('test-token-')) {
                const tokenVal = idToken.replace('test-token-', '');
                let email, name;
                if (tokenVal.includes('@')) {
                    email = tokenVal;
                    const prefix = tokenVal.split('@')[0];
                    name = prefix.split(/[\._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ' Google';
                } else {
                    email = `${tokenVal}@gmail.com`;
                    name = tokenVal.charAt(0).toUpperCase() + tokenVal.slice(1) + ' Google';
                }
                const googleUser = {
                    googleId: `google-id-${tokenVal}`,
                    email: email,
                    name: name,
                    picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                };
                return done(null, googleUser);
            }

            let payload;
            try {
                const ticket = await client.verifyIdToken({
                    idToken: idToken,
                    audience: CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch (err) {
                // Another development mock fallback for standard token (disabled in production)
                if (isDev && (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') && idToken === 'development-test-token') {
                    payload = {
                        sub: 'dev-google-id-123456',
                        email: 'dev-google-user@example.com',
                        name: 'Dev Google User',
                        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                    };
                } else {
                    return done(err, false, { message: `Google verification failed: ${err.message}` });
                }
            }

            if (!payload) {
                return done(null, false, { message: 'Google authentication payload invalid' });
            }

            const googleUser = {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };

            return done(null, googleUser);
        } catch (error) {
            console.error('Passport Google Custom Strategy Error:', error);
            return done(error);
        }
    }
));

module.exports = passport;
```

### Google Authentication Route
* File path: [authRoutes.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/routes/authRoutes.js)
* The routing file defines and binds the `/google-login` endpoint directly:

```javascript
// server/routes/authRoutes.js (Excerpt)
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    googleLogin, // Imported here
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/google-login', googleLogin); // Mounted here

module.exports = router;
```

### Backend googleLogin Controller
* File path: [authController.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/controllers/authController.js) (Excerpt: lines 582-677)
* Automatically creates a new user profile with the `'google'` provider and sets `isVerified = true` and `role = 'admin'` if no user with that googleId or email is found.

```javascript
// server/controllers/authController.js (Excerpt)
// @desc    Google OAuth login/signup verification
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res, next) => {
    const safeNext = typeof next === 'function' ? next : (err) => { if (err) console.error(err); };
    passport.authenticate('google-id-token', { session: false }, async (err, googleUser, info) => {
        try {
            if (err || !googleUser) {
                return res.status(400).json({
                    message: info?.message || 'Google authentication failed'
                });
            }

            const { googleId, email, name, picture } = googleUser;
            let finalUser = null;
            let isNewUser = false;
            const isDev = process.env.NODE_ENV !== 'production';

            if (mongoose.connection.readyState !== 1) {
                if (!isDev) {
                    return res.status(500).json({ message: 'Database connection is not ready' });
                }
                
                console.log(`[HYBRID MODE] Authenticating Google login in-memory: ${email}`);
                
                let user = mockUsers.get(email);
                if (!user) {
                    isNewUser = true;
                    user = {
                        _id: 'mock-google-' + Date.now(),
                        name,
                        email,
                        googleId,
                        profileImage: picture,
                        provider: 'google',
                        isVerified: true,
                        role: 'admin',
                        loginAttempts: 0
                    };
                } else {
                    user.googleId = googleId;
                    if (!user.profileImage) user.profileImage = picture;
                    user.provider = 'google';
                    user.isVerified = true;
                }
                
                mockUsers.set(email, user);
                finalUser = user;
            } else {
                // 1. Try to find user by googleId
                let user = await User.findOne({ googleId });

                if (!user) {
                    // 2. Try to find user by email
                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = googleId;
                        if (!user.profileImage) user.profileImage = picture;
                        user.isVerified = true;
                        user.provider = 'google';
                        await user.save();
                    } else {
                        // 3. Register user automatically
                        isNewUser = true;
                        user = await User.create({
                            name,
                            email,
                            googleId,
                            profileImage: picture,
                            isVerified: true,
                            role: 'admin',
                            provider: 'google',
                        });
                    }
                }
                finalUser = user;
            }

            res.json({
                success: true,
                message: 'Google Login Successful',
                isNewUser,
                _id: finalUser._id,
                name: finalUser.name,
                email: finalUser.email,
                role: finalUser.role,
                profileImage: finalUser.profileImage,
                token: generateToken(finalUser._id),
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })(req, res, safeNext);
};
```

### Frontend Google Auth Button Component
* File path: [GoogleAuthButton.jsx](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/src/components/GoogleAuthButton.jsx)
* If `VITE_GOOGLE_CLIENT_ID` is set, it injects the official Google Sign-In SDK (`https://accounts.google.com/gsi/client`) and renders the button container (`#googleSignInBtn`).
* If not, it falls back to a styled mock button that opens `/dev-google-login.html` as a popup and listens to `message` events.

```javascript
// src/components/GoogleAuthButton.jsx
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
```

### Dev Mock Google Chooser Page
* File path: [dev-google-login.html](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/public/dev-google-login.html)
* Provides a mock Google interface. Clicking a mock user or submitting custom credentials calls `selectAccount()`, which returns the details back to the parent window opener via `postMessage`.

```html
<!-- public/dev-google-login.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in - Google Accounts</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background-color: #f0f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            color: #1f1f1f;
        }
        .container {
            background-color: #ffffff;
            border-radius: 28px;
            padding: 40px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            border: 1px solid #e0e0e0;
            text-align: center;
        }
        .logo {
            display: flex;
            justify-content: center;
            margin-bottom: 16px;
        }
        .logo svg {
            width: 74px;
            height: 24px;
        }
        h1 {
            font-size: 24px;
            font-weight: 400;
            margin-bottom: 8px;
            color: #1f1f1f;
        }
        .subtitle {
            font-size: 16px;
            color: #444746;
            margin-bottom: 32px;
        }
        .account-list {
            list-style: none;
            text-align: left;
            margin-bottom: 24px;
            border-bottom: 1px solid #e3e3e3;
        }
        .account-item {
            display: flex;
            align-items: center;
            padding: 12px 0;
            border-top: 1px solid #e3e3e3;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        .account-item:hover {
            background-color: #f7f9fc;
        }
        .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #0b57d0;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 500;
            font-size: 16px;
            margin-right: 12px;
        }
        .account-details {
            flex-grow: 1;
        }
        .account-name {
            font-weight: 500;
            font-size: 14px;
            color: #1f1f1f;
        }
        .account-email {
            font-size: 12px;
            color: #444746;
            margin-top: 2px;
        }
        .custom-account-btn {
            background: none;
            border: none;
            color: #0b57d0;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 16px;
            width: 100%;
            text-align: left;
            padding: 8px 4px;
            border-radius: 4px;
        }
        .custom-account-btn:hover {
            background-color: rgba(11, 87, 208, 0.04);
        }
        .custom-form {
            display: none;
            text-align: left;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed #cccccc;
        }
        .form-group {
            margin-bottom: 12px;
        }
        .form-group label {
            display: block;
            font-size: 12px;
            font-weight: 500;
            color: #444746;
            margin-bottom: 4px;
        }
        .form-group input {
            width: 100%;
            padding: 10px 14px;
            border: 1px solid #747775;
            border-radius: 4px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }
        .form-group input:focus {
            border-color: #0b57d0;
            box-shadow: 0 0 0 1px #0b57d0;
        }
        .submit-btn {
            background-color: #0b57d0;
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 100px;
            font-weight: 500;
            font-size: 14px;
            cursor: pointer;
            width: 100%;
            margin-top: 8px;
            transition: background-color 0.2s;
        }
        .submit-btn:hover {
            background-color: #0842a0;
        }
        .footer {
            margin-top: 32px;
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #747775;
        }
        .footer a {
            color: #747775;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <svg viewBox="0 0 74 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.7 15.6c-2.4 0-4.5-1.9-4.5-4.6s2-4.6 4.5-4.6c1.3 0 2.4.5 3.2 1.3l2.3-2.3C11.7 3.8 9.9 3 7.7 3 3.4 3 0 6.4 0 11s3.4 8 7.7 8c2.6 0 4.4-1.1 5.6-2.6l-2.4-2.4c-.8.8-1.8 1.6-3.2 1.6z" fill="#4285F4"/>
                <path d="M19.1 19V4.6h3.2v14.4H19.1z" fill="#34A853"/>
                <path d="M28.4 15.6c-2.4 0-4.5-1.9-4.5-4.6s2-4.6 4.5-4.6 4.5 1.9 4.5 4.6-2.1 4.6-4.5 4.6zm0-7.2c-1.3 0-2.3 1-2.3 2.6s1 2.6 2.3 2.6 2.3-1 2.3-2.6-1-2.6-2.3-2.6z" fill="#EA4335"/>
                <path d="M38.8 15.6c-2.4 0-4.5-1.9-4.5-4.6s2-4.6 4.5-4.6 4.5 1.9 4.5 4.6-2.1 4.6-4.5 4.6zm0-7.2c-1.3 0-2.3 1-2.3 2.6s1 2.6 2.3 2.6 2.3-1 2.3-2.6-1-2.6-2.3-2.6z" fill="#FBBC05"/>
                <path d="M49.2 19c-1.2 0-2.3-.5-2.8-1.2h-.1V18c0 1.8-1 2.7-2.6 2.7-1.3 0-2.1-.9-2.4-1.7l2.8-1.1c.3.7.8 1.2 1.5 1.2 1 0 1.5-.6 1.5-1.6v-1.1h-.1c-.5.7-1.6 1.2-2.8 1.2-2.3 0-4.4-2-4.4-4.6S42.5 8 44.8 8c1.2 0 2.3.5 2.8 1.1h.1V8.4h3.1V18c0 2.7-1.6 4-4.1 4-2.5 0-4.1-1.7-4.7-3.1l2.8-1.2c.5 1.1 1.5 1.7 2.7 1.7zm-2.1-10.6c-1.3 0-2.3 1.1-2.3 2.6s1 2.6 2.3 2.6 2.3-1.1 2.3-2.6-1-2.6-2.3-2.6z" fill="#4285F4"/>
                <path d="M59.4 15.6c-2.2 0-4.2-1.8-4.2-4.5s1.9-4.6 4.1-4.6c2.2 0 3.9 1.7 3.9 4.3v.7h-6.8c.2 1.4 1.2 2.2 2.5 2.2 1.2 0 2-.6 2.5-1.3l2.5 1.7c-.7 1-2.1 2.1-4.2 2.1zm-3-6.5h4.6c0-1.1-.8-1.9-1.9-1.9-1.1 0-1.9.8-2.3 1.9z" fill="#EA4335"/>
            </svg>
        </div>
        <h1>Choose an account</h1>
        <div class="subtitle">to continue to KiranaSmart AI</div>

        <ul class="account-list">
            <li class="account-item" onclick="selectAccount('Dharmu', 'dharmu@kiranasmart.com')">
                <div class="avatar" style="background-color: #0b57d0;">D</div>
                <div class="account-details">
                    <div class="account-name">Dharmu (Owner)</div>
                    <div class="account-email">dharmu@kiranasmart.com</div>
                </div>
            </li>
            <li class="account-item" onclick="selectAccount('Admin User', 'admin@kiranasmart.com')">
                <div class="avatar" style="background-color: #b06000;">A</div>
                <div class="account-details">
                    <div class="account-name">Admin User</div>
                    <div class="account-email">admin@kiranasmart.com</div>
                </div>
            </li>
            <li class="account-item" onclick="selectAccount('Staff Member', 'staff@kiranasmart.com')">
                <div class="avatar" style="background-color: #0f5132;">S</div>
                <div class="account-details">
                    <div class="account-name">Staff Member</div>
                    <div class="account-email">staff@kiranasmart.com</div>
                </div>
            </li>
        </ul>

        <button class="custom-account-btn" onclick="toggleCustomForm()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Use a custom mock account
        </button>

        <form id="customForm" class="custom-form" onsubmit="handleCustomSubmit(event)">
            <div class="form-group">
                <label for="customName">Full Name</label>
                <input type="text" id="customName" placeholder="e.g. John Doe" required>
            </div>
            <div class="form-group">
                <label for="customEmail">Email Address</label>
                <input type="email" id="customEmail" placeholder="e.g. john@example.com" required>
            </div>
            <button type="submit" class="submit-btn">Continue</button>
        </form>

        <div class="footer">
            <span>English (United States)</span>
            <div>
                <a href="#" style="margin-right: 12px;">Help</a>
                <a href="#" style="margin-right: 12px;">Privacy</a>
                <a href="#">Terms</a>
            </div>
        </div>
    </div>

    <script>
        function selectAccount(name, email) {
            const idToken = 'test-token-' + email;
            if (window.opener) {
                window.opener.postMessage({
                    type: 'MOCK_GOOGLE_AUTH_SUCCESS',
                    idToken: idToken
                }, '*');
            }
            window.close();
        }

        function toggleCustomForm() {
            const form = document.getElementById('customForm');
            form.style.display = form.style.display === 'block' ? 'none' : 'block';
        }

        function handleCustomSubmit(e) {
            e.preventDefault();
            const name = document.getElementById('customName').value;
            const email = document.getElementById('customEmail').value;
            selectAccount(name, email);
        }
    </script>
</body>
</html>
```

---

## 4. Frontend Structure

* **Framework & Bundler**: React `^19.2.0` with Vite `^7.3.1` (based on the workspace `package.json`).
* **Environment Configuration**: Variables are declared in a root `.env` file containing:
  - `VITE_API_URL` (local API target URL)
  - `VITE_GOOGLE_CLIENT_ID` (Google GSI credentials identifier, empty locally)
* **Auth State Management**: The client stores credentials in `localStorage` under the `"user"` key. User verification is validated in components via `authService.getCurrentUser()`.
* **Routing Guards**: `ProtectedRoute.jsx` intercepts non-authenticated users and redirects them to `/login`.

### index.html
* File path: [index.html](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/index.html)
* Implements standard preconnects for fonts and loads the React entry point `/src/main.jsx`.

```html
<!-- index.html -->
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/KSfavicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>KiranaSmart AI Inventory System</title>
  <meta name="description"
    content="AI powered kirana store inventory management with forecasting, barcode POS, vendor automation and analytics." />

  <!-- Optimize Font Loading -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <script>
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  </script>
</head>

<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>

</html>
```

### Login Component
* File path: [Login.jsx](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/src/pages/Login.jsx)

```javascript
// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import InputField from '../components/InputField';
import authService from '../services/authService';
import GoogleAuthButton from '../components/GoogleAuthButton';

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const clearError = () => error && setError('');

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

export default Login;
```

### Register Component
* File path: [Register.jsx](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/src/pages/Register.jsx)

```javascript
// src/pages/Register.jsx
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
            const res = await authService.register({ name, email, password, confirmPassword, role });
            if (res.otp) {
                toast.success(`Fallback Verification OTP: ${res.otp}`, { duration: 8000 });
                navigate(`/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(res.otp)}`);
            } else {
                toast.success('Registration Successful. OTP Sent.');
                navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
            }
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
```

### Router Guards / Protected Route Component
* File path: [ProtectedRoute.jsx](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/src/components/ProtectedRoute.jsx)

```javascript
// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = () => {
    const currentUser = authService.getCurrentUser();

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
```

---

## 5. Backend Structure

* **Framework**: Express `^5.2.1` (based on `server/package.json`).
* **Entry Point**: `server/server.js`.
* **CORS Configuration**: CORS allows custom headers (`Content-Type`, `Authorization`), credentials (`true`), options/methods, and validates request origins against `allowedOrigins` (and `localhost` inside development mode).
* **Helmet Setup**: The server uses Helmet securely, disabling `contentSecurityPolicy` to ensure Google Sign-In script mapping works as expected.
* **Environment variables loaded**: `dotenv.config({ path: path.join(__dirname, '.env') });` handles loading env configuration before modules are imported.

### server.js CORS / Helmet Logic
* File path: [server.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/server.js) (Excerpt: lines 16-76)

```javascript
// server/server.js (CORS & Helmet Excerpt)
// Secure Headers using Helmet
const helmet = require('helmet');
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to ensure Google Sign-In script & maps run smoothly
    crossOriginEmbedderPolicy: false
}));

// Secure CORS Config
let allowedOrigins = [
    'https://kirana-store-oq3u.vercel.app'
];

if (process.env.CLIENT_URL) {
    const cleanClientUrl = process.env.CLIENT_URL.trim().replace(/\/$/, "");
    if (cleanClientUrl && !allowedOrigins.includes(cleanClientUrl)) {
        allowedOrigins.push(cleanClientUrl);
    }
}

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173');
} else {
    // In production, strictly filter out any localhost values to prevent returning them
    allowedOrigins = allowedOrigins.filter(url => !url.includes('localhost') && !url.includes('127.0.0.1'));
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        
        // Clean incoming origin string
        const cleanOrigin = origin.replace(/\/$/, "");
        
        if (allowedOrigins.indexOf(cleanOrigin) !== -1 || (process.env.NODE_ENV !== 'production' && cleanOrigin.startsWith('http://localhost:'))) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Full Backend Auth Controller
* File path: [authController.js](file:///c:/Users/dharm/OneDrive/Desktop/Kirana-Store/server/controllers/authController.js)

```javascript
// server/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const passport = require('passport');
const mongoose = require('mongoose');

// ==========================================
// IN-MEMORY MOCK DATABASE FALLBACK
// ==========================================
const mockUsers = new Map();

// Helper to pre-populate default user for testing in mock mode
const defaultSalt = bcrypt.genSaltSync(10);
const defaultPasswordHash = bcrypt.hashSync('Dharmu@2026', defaultSalt);
mockUsers.set('admin@kiranasmart.com', {
    _id: 'mock-admin-uuid-99999',
    name: 'Admin User',
    email: 'admin@kiranasmart.com',
    password: defaultPasswordHash,
    role: 'admin',
    isVerified: true,
    loginAttempts: 0,
    lockUntil: null,
    otp: null,
    otpExpires: null
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'default_local_dev_jwt_secret_key_12345', {
        expiresIn: '7d',
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // check if database is disconnected, use mock
        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Registering user in-memory: ${email}`);
            
            if (mockUsers.has(email)) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            mockUsers.set(email, {
                _id: 'mock-user-' + Date.now(),
                name,
                email,
                password: hashedPassword,
                role: role || 'admin',
                isVerified: false,
                otp,
                otpExpires,
                loginAttempts: 0
            });
        } else {
            // Check if user exists
            const userExists = await User.findOne({ email });

            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // Create unverified user
            await User.create({
                name,
                email,
                password, // pre-save hook handles hashing
                role: role || 'admin',
                isVerified: false,
                otp,
                otpExpires,
            });
        }

        // Send OTP email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 5px;">KiranaSmart AI</h2>
                <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 0;">Smart Inventory Management</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="font-size: 16px; color: #374151;">Dear ${name},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">Thank you for registering with KiranaSmart AI. To activate your account, verify your email address using the One-Time Password (OTP) below:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f97316; background-color: #fff7ed; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fdba74; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #dc2626; font-size: 14px; font-weight: 500;">This OTP will expire in 5 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 KiranaSmart. All rights reserved.</p>
            </div>
        `;

        const emailResult = await sendEmail({
            to: email,
            subject: 'KiranaSmart AI - Verify Your Email Address',
            text: `Your email OTP is: ${otp}. It will expire in 5 minutes.`,
            html: emailHtml
        });

        res.status(201).json({
            success: true,
            message: emailResult.fallback 
                ? `Registration Successful. (Dev Fallback: OTP is ${otp})` 
                : 'Registration Successful. OTP Sent Successfully.',
            email: email,
            otp: emailResult.fallback ? otp : undefined
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP for account activation
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Verifying OTP in-memory: ${email}`);
            
            const user = mockUsers.get(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: 'User is already verified' });
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            user.isVerified = true;
            user.otp = null;
            user.otpExpires = null;
            mockUsers.set(email, user);
        } else {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: 'User is already verified' });
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // Activate user
            user.isVerified = true;
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Email Verified',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Resend OTP for email verification
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        let name = '';

        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Resending OTP in-memory: ${email}`);
            const user = mockUsers.get(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.isVerified) {
                return res.status(400).json({ message: 'User is already verified' });
            }

            user.otp = otp;
            user.otpExpires = otpExpires;
            mockUsers.set(email, user);
            name = user.name;
        } else {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.isVerified) {
                return res.status(400).json({ message: 'User is already verified' });
            }

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
            name = user.name;
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 5px;">KiranaSmart AI</h2>
                <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 0;">Smart Inventory Management</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="font-size: 16px; color: #374151;">Dear ${name},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">Here is your requested verification One-Time Password (OTP):</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f97316; background-color: #fff7ed; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fdba74; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #dc2626; font-size: 14px; font-weight: 500;">This OTP will expire in 5 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 KiranaSmart. All rights reserved.</p>
            </div>
        `;

        const emailResult = await sendEmail({
            to: email,
            subject: 'KiranaSmart AI - Resend Email Verification OTP',
            text: `Your email OTP is: ${otp}. It will expire in 5 minutes.`,
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: emailResult.fallback 
                ? `OTP Sent. (Dev Fallback: OTP is ${otp})` 
                : 'OTP Sent Successfully',
            otp: emailResult.fallback ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Authenticating user in-memory: ${email}`);
            
            const user = mockUsers.get(email);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Lockout check
            if (user.lockUntil && user.lockUntil > Date.now()) {
                const timeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
                return res.status(403).json({
                    message: `Account is locked due to multiple failed login attempts. Try again in ${timeRemaining} minute(s).`
                });
            }

            // Verification check
            if (!user.isVerified) {
                return res.status(400).json({ message: 'Please verify your email.' });
            }

            // Password check
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                user.loginAttempts = (user.loginAttempts || 0) + 1;

                if (user.loginAttempts >= 5) {
                    user.lockUntil = Date.now() + 15 * 60 * 1000;
                    user.loginAttempts = 0;
                    mockUsers.set(email, user);
                    return res.status(403).json({
                        message: 'Account locked for 15 minutes due to 5 failed attempts.'
                    });
                } else {
                    mockUsers.set(email, user);
                    return res.status(400).json({
                        message: `Invalid credentials. ${5 - user.loginAttempts} attempt(s) remaining.`
                    });
                }
            }

            // Successful login, clear counters
            user.loginAttempts = 0;
            user.lockUntil = null;
            mockUsers.set(email, user);

            return res.json({
                success: true,
                message: 'Login Successful',
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }

        // Standard MongoDB Logic
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const timeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
            return res.status(403).json({
                message: `Account is locked due to multiple failed login attempts. Try again in ${timeRemaining} minute(s).`
            });
        }

        // Check email verification
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email.' });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minute lock
                user.loginAttempts = 0; // Reset counter for after unlock
                await user.save();
                return res.status(403).json({
                    message: 'Account locked for 15 minutes due to 5 failed attempts.'
                });
            } else {
                await user.save();
                return res.status(400).json({
                    message: `Invalid credentials. ${5 - user.loginAttempts} attempt(s) remaining.`
                });
            }
        }

        // Reset lock tracking
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Login Successful',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Request Forgot Password OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        let name = '';

        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Requesting forgot password OTP in-memory: ${email}`);
            const user = mockUsers.get(email);
            if (!user) {
                return res.status(400).json({ message: 'User with this email does not exist' });
            }

            user.otp = otp;
            user.otpExpires = otpExpires;
            mockUsers.set(email, user);
            name = user.name;
        } else {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'User with this email does not exist' });
            }

            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();
            name = user.name;
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 5px;">KiranaSmart AI</h2>
                <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 0;">Smart Inventory Management</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="font-size: 16px; color: #374151;">Dear ${name},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">We received a request to reset your password. Use the OTP code below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #3b82f6; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #bfdbfe; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #dc2626; font-size: 14px; font-weight: 500;">This OTP will expire in 5 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 KiranaSmart. All rights reserved.</p>
            </div>
        `;

        const emailResult = await sendEmail({
            to: email,
            subject: 'KiranaSmart AI - Password Reset Request',
            text: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`,
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: emailResult.fallback 
                ? `OTP Sent. (Dev Fallback: OTP is ${otp})` 
                : 'OTP Sent Successfully',
            otp: emailResult.fallback ? otp : undefined
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify OTP for Password Reset
// @route   POST /api/auth/verify-reset-otp
// @access  Public
const verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        if (!email || !otp) {
            return res.status(400).json({ message: 'Please provide email and OTP' });
        }

        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Verifying Reset OTP in-memory: ${email}`);
            const user = mockUsers.get(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }
        } else {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }
        }

        res.status(200).json({
            success: true,
            message: 'OTP Verified Successfully',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset Password with OTP Verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        if (mongoose.connection.readyState !== 1) {
            console.log(`[HYBRID MODE] Resetting password in-memory: ${email}`);
            
            const user = mockUsers.get(email);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'OTP is expired or invalid. Please request a new one.' });
            }

            const isSame = await bcrypt.compare(newPassword, user.password);
            if (isSame) {
                return res.status(400).json({ message: 'New password cannot be same as previous password' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            user.password = hashedPassword;
            user.otp = null;
            user.otpExpires = null;
            user.loginAttempts = 0;
            user.lockUntil = null;
            mockUsers.set(email, user);
        } else {
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Double check OTP
            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return res.status(400).json({ message: 'OTP is expired or invalid. Please request a new one.' });
            }

            // Validate that new password is not same as previous
            const isSame = await mongoose.model('User').hydrate(user).matchPassword(newPassword);
            if (isSame) {
                return res.status(400).json({ message: 'New password cannot be same as previous password' });
            }

            // Update password and clear OTP fields
            user.password = newPassword; // pre-save hook handles hashing
            user.otp = undefined;
            user.otpExpires = undefined;
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Password Updated Successfully',
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google OAuth login/signup verification
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = async (req, res, next) => {
    const safeNext = typeof next === 'function' ? next : (err) => { if (err) console.error(err); };
    passport.authenticate('google-id-token', { session: false }, async (err, googleUser, info) => {
        try {
            if (err || !googleUser) {
                return res.status(400).json({
                    message: info?.message || 'Google authentication failed'
                });
            }

            const { googleId, email, name, picture } = googleUser;
            let finalUser = null;
            let isNewUser = false;
            const isDev = process.env.NODE_ENV !== 'production';

            if (mongoose.connection.readyState !== 1) {
                if (!isDev) {
                    return res.status(500).json({ message: 'Database connection is not ready' });
                }
                
                console.log(`[HYBRID MODE] Authenticating Google login in-memory: ${email}`);
                
                let user = mockUsers.get(email);
                if (!user) {
                    isNewUser = true;
                    user = {
                        _id: 'mock-google-' + Date.now(),
                        name,
                        email,
                        googleId,
                        profileImage: picture,
                        provider: 'google',
                        isVerified: true,
                        role: 'admin',
                        loginAttempts: 0
                    };
                } else {
                    user.googleId = googleId;
                    if (!user.profileImage) user.profileImage = picture;
                    user.provider = 'google';
                    user.isVerified = true;
                }
                
                mockUsers.set(email, user);
                finalUser = user;
            } else {
                // 1. Try to find user by googleId
                let user = await User.findOne({ googleId });

                if (!user) {
                    // 2. Try to find user by email
                    user = await User.findOne({ email });

                    if (user) {
                        user.googleId = googleId;
                        if (!user.profileImage) user.profileImage = picture;
                        user.isVerified = true;
                        user.provider = 'google';
                        await user.save();
                    } else {
                        // 3. Register user automatically
                        isNewUser = true;
                        user = await User.create({
                            name,
                            email,
                            googleId,
                            profileImage: picture,
                            isVerified: true,
                            role: 'admin',
                            provider: 'google',
                        });
                    }
                }
                finalUser = user;
            }

            res.json({
                success: true,
                message: 'Google Login Successful',
                isNewUser,
                _id: finalUser._id,
                name: finalUser.name,
                email: finalUser.email,
                role: finalUser.role,
                profileImage: finalUser.profileImage,
                token: generateToken(finalUser._id),
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    })(req, res, safeNext);
};

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            profileImage: req.user.profileImage,
        },
    });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;

        // If password is provided, verify old password before updating
        if (req.body.newPassword) {
            if (!req.body.oldPassword) {
                return res.status(400).json({ message: 'Please provide old password' });
            }

            const isMatch = await user.matchPassword(req.body.oldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid old password' });
            }

            user.password = req.body.newPassword;
        }

        const updatedUser = await user.save();

        res.json({
            success: true,
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                profileImage: updatedUser.profileImage,
            }
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    verifyOtp,
    resendOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    googleLogin,
    mockUsers,
};
```

---

## 6. Deployment & Environment

* **Deployment Configuration**:
  - **Frontend**: Deployed on Vercel. A root `vercel.json` ensures client-side routing rewrites fall back to `index.html` (single page application support).
  - **Backend**: Deployed on Render (`https://kirana-store-2ykl.onrender.com`).
* **Environment variables in production**:
  - **Frontend Environment**:
    - `VITE_API_URL` (Pointed to backend Render server URL)
    - `VITE_GOOGLE_CLIENT_ID` (Required to initialize official Google OneTap/popup button)
  - **Backend Environment**:
    - `PORT` (Configures Express server listening port)
    - `MONGO_URI` (MongoDB connection URI string)
    - `JWT_SECRET` (Core secret string for app signing/verification)
    - `EMAIL_USER` (SMTP Username for mailers)
    - `EMAIL_PASS` (SMTP App password credentials)
    - `SMTP_PORT` (SMTP port settings, standard 587)
    - `GOOGLE_CLIENT_ID` (Matches frontend client ID; verified by Passport strategy)
    - `GOOGLE_CLIENT_SECRET` (Stored on backend; currently declared in `.env` but not used by Passport Custom Strategy verification)
    - `CLIENT_URL` (Points to production Vercel frontend URL, added to CORS allowed origins)
    - `RESEND_API_KEY` (Mailer backup API service credential)
    - `appName` (MongoDB clustering metadata)

---

## 7. Risk Surface
1. **Password-less Accounts & Lockout**: Google-only users have no `password` value set in Mongoose (it stays undefined). If someone manually submits their email address in standard `/login` route, password comparison (`user.matchPassword(password)`) will return `false`. While security-correct, this will increment `loginAttempts` and can result in the user's account getting locked (`lockUntil` set).
2. **Mock Password Reset 500 Error**: During password resets in hybrid/mock mode, `bcrypt.compare(newPassword, user.password)` will throw an unhandled exception (`Error: data and hash must be strings`) because Google-only users have `password = undefined` in their mock user map. This results in an API `500 Server Error` instead of a validation check.
3. **Password Setting from Profile**: The profile update controller (`updateProfile`) expects `oldPassword` before setting `newPassword`. Since Google-only users have no password, they can never satisfy this condition, making it impossible to add a password to their profile to enable hybrid/local logins.
4. **Local-to-Google Merges**: If a local user exists and later authenticates with Google, `googleLogin` assigns the `googleId` and replaces their `provider` field with `'google'`. Subsequent calls to update local passwords must verify they do not conflict with or strip their social provider properties.
5. **No Client ID Fallback Vulnerability**: Passport contains checks for dev fallbacks. If `isDev` is true or if `GOOGLE_CLIENT_ID` is set to `YOUR_GOOGLE_CLIENT_ID`, the passport strategy bypasses verification. In a production build, these fallbacks must be strictly prevented. Although Passport checks `process.env.NODE_ENV !== 'production'`, configuration mishaps could trigger these fallbacks.
6. **Hardcoded App Token Lifetime**: The application JWT generated by the backend expires in `'7d'`. We must ensure the client behaves correctly when the backend token expires, independent of Google's token status (the Google ID token is immediate and ephemeral during the login call, whereas the app session relies entirely on the local custom JWT).

---

## 8. Open Questions
* **Client Secret Usage**: The environment configurations specify `GOOGLE_CLIENT_SECRET` on the backend, but the custom Passport strategy (`google-id-token`) only implements `verifyIdToken` which requires the Client ID and not the Client Secret. Will the backend need to implement authorization code exchange, or is the popup ID token verification sufficient?
* **Local Password Setting**: Should Google users be allowed to transition to a hybrid authentication model (defining a local password)? If so, a route or condition allowing password definition without verifying `oldPassword` (specifically for users with `provider: 'google'` and no current password) must be designed.
* **Hybrid Mode Retention**: Is the hybrid mock mode (`mockUsers`) purely a development convenience, or should we design the implementation to cleanly separate it from production database dependencies?
* **Account Deletion/Revocation**: If a Google user deletes their account or revokes the app authorization from Google, what are the cleanup flows expected in the backend (e.g. clearing `googleId` or archiving the DB user record)?
