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
    googleLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const {
    validateRegister,
    validateLogin,
    validateResetPassword,
} = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', validateResetPassword, resetPassword);
router.post('/google-login', googleLogin);

router.route('/profile')
    .get(protect, getMe)
    .put(protect, updateProfile);

module.exports = router;

