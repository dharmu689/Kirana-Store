const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');
const passport = require('passport');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
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
        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Create unverified user
        const user = await User.create({
            name,
            email,
            password, // pre-save hook handles hashing
            role: role || 'admin',
            isVerified: false,
            otp,
            otpExpires,
        });

        if (user) {
            // Send OTP email
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 5px;">KiranaSmart AI</h2>
                    <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 0;">Smart Inventory Management</p>
                    <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                    <p style="font-size: 16px; color: #374151;">Dear ${name},</p>
                    <p style="font-size: 16px; color: #374151; line-height: 1.5;">Thank you for registering with KiranaSmart AI. To activate your account, please verify your email address using the 6-digit One-Time Password (OTP) below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f97316; background-color: #fff7ed; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fdba74; display: inline-block;">${otp}</span>
                    </div>
                    <p style="color: #dc2626; font-size: 14px; font-weight: 500;">This OTP will expire in 5 minutes.</p>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">If you did not request this registration, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 KiranaSmart. All rights reserved.</p>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: 'KiranaSmart AI - Verify Your Email Address',
                text: `Your email OTP is: ${otp}. It will expire in 5 minutes.`,
                html: emailHtml
            });

            res.status(201).json({
                success: true,
                message: 'Registration Successful. OTP Sent Successfully.',
                email: user.email,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
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

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 5px;">KiranaSmart AI</h2>
                <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 0;">Smart Inventory Management</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">Here is your requested verification One-Time Password (OTP):</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #f97316; background-color: #fff7ed; padding: 12px 24px; border-radius: 8px; border: 1px dashed #fdba74; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #dc2626; font-size: 14px; font-weight: 500;">This OTP will expire in 5 minutes.</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 KiranaSmart. All rights reserved.</p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'KiranaSmart AI - Resend Email Verification OTP',
            text: `Your email OTP is: ${otp}. It will expire in 5 minutes.`,
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
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
            // Track failed attempts
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

        // Password is correct, reset lock tracking
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

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ message: 'Please provide email' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User with this email does not exist' });
        }

        const otp = generateOTP();
        const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <h2 style="color: #2563eb; text-align: center; font-size: 24px; margin-bottom: 5px;">KiranaSmart AI</h2>
                <p style="color: #6b7280; text-align: center; font-size: 14px; margin-top: 0;">Smart Inventory Management</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="font-size: 16px; color: #374151;">Dear ${user.name},</p>
                <p style="font-size: 16px; color: #374151; line-height: 1.5;">We received a request to reset your KiranaSmart password. Please use the following OTP code to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #3b82f6; background-color: #eff6ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #bfdbfe; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #dc2626; font-size: 14px; font-weight: 500;">This OTP will expire in 5 minutes.</p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">If you did not request a password reset, please ignore this email and secure your account.</p>
                <hr style="border: 0; border-top: 1px solid #f0f0f0; margin: 20px 0;"/>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 KiranaSmart. All rights reserved.</p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'KiranaSmart AI - Password Reset Request',
            text: `Your password reset OTP is: ${otp}. It will expire in 5 minutes.`,
            html: emailHtml
        });

        res.status(200).json({
            success: true,
            message: 'OTP Sent Successfully',
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

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
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
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Double check OTP
        if (user.otp !== otp || user.otpExpires < Date.now()) {
            return res.status(400).json({ message: 'OTP is expired or invalid. Please request a new one.' });
        }

        // Validate that new password is not same as previous
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ message: 'New password cannot be same as previous password' });
        }

        // Update password and clear OTP fields
        user.password = newPassword; // pre-save hook handles hashing
        user.otp = undefined;
        user.otpExpires = undefined;
        user.loginAttempts = 0; // reset failures too
        user.lockUntil = undefined;
        await user.save();

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
    passport.authenticate('google-id-token', { session: false }, async (err, googleUser, info) => {
        try {
            if (err || !googleUser) {
                return res.status(400).json({
                    message: info?.message || 'Google authentication failed'
                });
            }

            const { googleId, email, name, picture } = googleUser;

            // 1. Try to find user by googleId
            let user = await User.findOne({ googleId });

            if (!user) {
                // 2. Try to find user by email (might have registered standard before)
                user = await User.findOne({ email });

                if (user) {
                    // Update user with google info
                    user.googleId = googleId;
                    if (!user.profileImage) user.profileImage = picture;
                    user.isVerified = true; // Auto-verify email if google verified it
                    await user.save();
                } else {
                    // 3. Register user automatically
                    user = await User.create({
                        name,
                        email,
                        googleId,
                        profileImage: picture,
                        isVerified: true, // Google accounts are auto-verified
                        role: 'admin', // Auto signups default to store admin
                    });
                }
            }

            res.json({
                success: true,
                message: 'Google Login Successful',
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
    })(req, res, next);
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
};
