const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('../server/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/products', require('../server/routes/productRoutes'));
app.use('/api/categories', require('../server/routes/categoryRoutes'));
app.use('/api/dashboard', require('../server/routes/dashboardRoutes'));
app.use('/api/sales', require('../server/routes/salesRoutes'));
app.use('/api/reorder', require('../server/routes/reorderRoutes'));

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
