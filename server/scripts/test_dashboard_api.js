const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testDashboardAPI = async () => {
    try {
        console.log('--- Testing Dashboard API ---');

        // 1. Login
        console.log('1. Authenticating...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@kirana.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log('   Login successful.');
        } catch (err) {
            console.log('   Login failed, trying to register...');
            // Register fallback (omitted for brevity as we generally expect user from previous tests)
            throw err;
        }

        // 2. Get Dashboard Summary
        console.log('2. Fetching dashboard summary...');
        const summaryRes = await axios.get(`${API_URL}/dashboard/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const summary = summaryRes.data;

        console.log('   Dashboard Summary Received:');
        console.log(`   - Total Products: ${summary.totalProducts}`);
        console.log(`   - Total Revenue: ₹${summary.totalRevenue}`);
        console.log(`   - Total Sales: ${summary.totalSalesCount}`);
        console.log(`   - Low Stock Items: ${summary.lowStockCount}`);
        console.log(`   - Out of Stock: ${summary.outOfStockCount}`);
        console.log(`   - Recent Sales Count: ${summary.recentSales.length}`);

        if (summary.totalProducts >= 0 && summary.totalRevenue >= 0) {
            console.log('--- Test Completed Successfully ---');
        } else {
            console.error('--- Test Failed: Invalid Data ---');
        }

    } catch (error) {
        console.error('Test Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
    }
};

testDashboardAPI();
