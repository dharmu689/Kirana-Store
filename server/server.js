const path = require('path');
const dotenv = require('dotenv');

// Load env vars FIRST — before any other requires
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Secure Headers using Helmet
const helmet = require('helmet');
app.use(helmet({
    contentSecurityPolicy: false, // Disabled to ensure Google Sign-In script & maps run smoothly
    crossOriginEmbedderPolicy: false
}));

// Secure CORS Config
const allowedOrigins = [
    'http://localhost:5173',
    'https://kirana-store-oq3u.vercel.app'
];

if (process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Passport Authentication
const passport = require('./config/passport');
app.use(passport.initialize());

// Rate Limiter for authentication routes
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 authentication requests per 15 minutes
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/auth', authLimiter);

// Middleware
app.use(express.json());

// Serve PDF INVOICES statically
app.use('/invoices', express.static(path.join(__dirname, 'temp')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/reorder', require('./routes/reorderRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/vendor-orders', require('./routes/vendorOrderRoutes'));
app.use('/api/forecast', require('./routes/forecastRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/settings', require('./routes/storeSettingsRoutes'));
app.use('/api/settings', require('./routes/systemPreferencesRoutes'));
app.use('/api/settings/notifications', require('./routes/notificationSettingsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// axios.get(`${import.meta.env.VITE_API_URL}/api/products`);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
