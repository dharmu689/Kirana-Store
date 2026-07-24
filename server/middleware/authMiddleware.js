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

