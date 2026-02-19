const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testReorderLogic = async () => {
    try {
        console.log('--- Testing Reorder Logic ---');

        // 1. Authenticate
        console.log('1. Authenticating...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@kirana.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('   Login successful.');

        // 2. Fetch Reorder List (Before Change)
        console.log('2. Fetching Reorder List (Initial)...');
        const listRes1 = await axios.get(`${API_URL}/reorder/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Initial Alerts: ${listRes1.data.length}`);

        // 3. Create a product with low stock
        console.log('3. Creating/Updating a product to trigger reorder...');
        // We'll just create a new product for test to avoid messing up existing ones too much, or update one.
        // Let's create one.
        const productRes = await axios.post(`${API_URL}/products`, {
            name: 'Test Low Stock Item ' + Date.now(),
            category: 'Provisions',
            price: 50,
            quantity: 5, // Low quantity
            reorderLevel: 10,
            supplierLeadTime: 2,
            safetyStock: 5
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Test product created with Quantity: 5, Reorder Level: 10');

        // 4. Fetch Reorder List (After Change)
        console.log('4. Fetching Reorder List (After)...');
        const listRes2 = await axios.get(`${API_URL}/reorder/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`   Created Product ID: ${productRes.data.product._id}`);
        const found = listRes2.data.find(p => p._id === productRes.data.product._id || p._id.toString() === productRes.data.product._id.toString());

        // Cleanup needs correct ID too
        const cleanupId = productRes.data.product._id;

        if (found) {
            console.log('   SUCCESS: Product found in reorder list.');
            console.log(`   - Name: ${found.name}`);
            console.log(`   - Current Qty: ${found.quantity}`);
            console.log(`   - Reorder Point: ${found.reorderPoint}`);
            console.log(`   - Suggested Order: ${found.suggestedOrderQty}`);
            console.log(`   - Status: ${found.status}`);
        } else {
            console.error('   FAILURE: Product NOT found in reorder list.');
            console.log('   Debug List IDs:', listRes2.data.map(p => p._id));
        }

        // 5. Cleanup (Delete the test product)
        console.log('5. Cleanup...');
        // 5. Cleanup (Delete the test product)
        console.log('5. Cleanup...');
        if (productRes.data.product && productRes.data.product._id) {
            await axios.delete(`${API_URL}/products/${productRes.data.product._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('   Test product deleted.');
        }

        console.log('--- Test Completed ---');

    } catch (error) {
        console.error('Test Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
    }
};

testReorderLogic();
