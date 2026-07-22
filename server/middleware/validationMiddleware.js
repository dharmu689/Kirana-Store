// Input Validation Middleware
// Validates email format and password complexity on the backend

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePasswordComplexity = (password) => {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    const errors = [];
    if (password.length < minLength) errors.push('Password must be at least 8 characters long');
    if (!hasUppercase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowercase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumber) errors.push('Password must contain at least one number');
    if (!hasSpecial) errors.push('Password must contain at least one special character (!@#$%^&*)');

    return {
        isValid: errors.length === 0,
        errors
    };
};

const validateRegister = (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Please add a name' });
    }

    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: 'Please add a valid email' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Please add a password' });
    }

    const passwordCheck = validatePasswordComplexity(password);
    if (!passwordCheck.isValid) {
        return res.status(400).json({ message: passwordCheck.errors[0] });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: 'Please add a valid email' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Please add your password' });
    }

    next();
};

const validateResetPassword = (req, res, next) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !validateEmail(email)) {
        return res.status(400).json({ message: 'Please add a valid email' });
    }

    if (!otp || otp.length !== 6) {
        return res.status(400).json({ message: 'Please add a valid 6-digit OTP' });
    }

    if (!newPassword) {
        return res.status(400).json({ message: 'Please add a new password' });
    }

    const passwordCheck = validatePasswordComplexity(newPassword);
    if (!passwordCheck.isValid) {
        return res.status(400).json({ message: passwordCheck.errors[0] });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateResetPassword
};
