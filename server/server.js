const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();





// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());

// Serve PDF INVOICES statically
app.use('/invoices', express.static(path.join(__dirname, 'temp')));


// CORS Configuration
app.use(cors({
    origin: "*"
}));
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
