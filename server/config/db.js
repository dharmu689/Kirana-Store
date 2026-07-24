const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('================================================================');
        console.error(`MongoDB Connection Error: ${error.message}`);
        console.error('SERVER WILL RUN IN IN-MEMORY HYBRID DEVELOPMENT MODE.');
        console.error('You can register, log in, use OTPs, and test Google OAuth.');
        console.error('To save data persistently, please run MongoDB or configure MONGO_URI in .env.');
        console.error('================================================================');
        // Do not call process.exit(1) to let the server run on port 5000 in fallback mode
    }
};

module.exports = connectDB;

