const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');






// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());


// CORS Configuration for Vercel/Production
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionSuccessStatus: 200
};
app.use(cors(corsOptions));



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
