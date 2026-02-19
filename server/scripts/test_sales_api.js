const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const testSalesAPI = async () => {
    try {
        console.log('--- Testing Sales API ---');

        let token;

        // 1. Try Login or Register
        console.log('1. Authenticating...');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@kirana.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log('   Login successful.');
        } catch (err) {
            console.log('   Login failed, trying to register...');
            try {
                const registerRes = await axios.post(`${API_URL}/auth/register`, {
                    name: 'Admin User',
                    email: 'admin@kirana.com',
                    password: 'password123',
                    role: 'admin'
                });
                token = registerRes.data.token;
                console.log('   Registration successful.');
            } catch (regErr) {
                console.error('   Authentication failed:', regErr.response?.data || regErr.message);
                return;
            }
        }

        // 2. Create a Product (to sell)
        console.log('2. Creating a test product...');
        const productRes = await axios.post(`${API_URL}/products`, {
            name: 'Test Product ' + Date.now(),
            category: 'Test Category',
            price: 100,
            quantity: 50,
            reorderLevel: 10
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('   Product API Response:', JSON.stringify(productRes.data, null, 2));

        const product = productRes.data.product;
        if (!product || !product._id) {
            throw new Error('Product creation failed: Invalid response');
        }

        console.log(`   Product created: ${product.name} (Qty: ${product.quantity})`);

        // 3. Create a Sale
        console.log('3. Creating a sale...');
        const saleRes = await axios.post(`${API_URL}/sales`, {
            product: product._id,
            quantitySold: 5,
            paymentMethod: 'Cash'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const sale = saleRes.data;
        console.log(`   Sale created for 5 items. Total Price: ${sale.totalPrice}`);

        // 4. Verify Stock Deduction
        console.log('4. Verifying stock deduction...');
        const updatedProductRes = await axios.get(`${API_URL}/products/${product._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const updatedProduct = updatedProductRes.data; // This might interpret 'data' as the product object based on getProductById controller

        // Check if updatedProductRes.data has .product or is the product itself
        // Based on productController.js: res.json({ ...product.toObject(), status })
        // So updatedProductRes.data IS the product object.

        console.log(`   Updated Stock: ${updatedProduct.quantity} (Expected: 45)`);

        if (updatedProduct.quantity === 45) {
            console.log('   Stock deduction verified!');
        } else {
            console.error('   Stock deduction FAILED!');
        }

        // 5. Get Sales Summary
        console.log('5. Getting sales summary...');
        const summaryRes = await axios.get(`${API_URL}/sales/summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   Sales Summary:', summaryRes.data);

        console.log('--- Test Completed Successfully ---');

    } catch (error) {
        console.error('Test Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
    }
};

testSalesAPI();
