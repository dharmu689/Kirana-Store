const BASE_URL = 'http://localhost:5000/api';

const adminUser = {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
};

const staffUser = {
    name: 'Staff User',
    email: 'staff@example.com',
    password: 'password123',
    role: 'staff'
};

let adminToken = '';
let staffToken = '';
let createdProductId = '';

async function loginOrRegister(user) {
    console.log(`\nAttempting to login as ${user.role}...`);
    let res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: user.password })
    });

    if (res.status === 401 || res.status === 404 || res.status === 400) {
        console.log(`Login failed, attempting to register as ${user.role}...`);
        res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
    }

    const data = await res.json();
    if (!res.ok) {
        throw new Error(`Auth failed: ${data.message}`);
    }
    console.log(`Authenticated as ${user.role}`);
    return data.token;
}

async function runTests() {
    try {
        // 1. Authenticate
        adminToken = await loginOrRegister(adminUser);
        staffToken = await loginOrRegister(staffUser);

        // 2. Admin Create Product
        console.log('\nTesting Create Product (Admin)...');
        const productData = {
            name: 'Test Product',
            category: 'Test Category',
            price: 100,
            quantity: 50,
            reorderLevel: 10,
            expiryDate: '2025-12-31',
            supplierLeadTime: 5
        };

        const createRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify(productData)
        });
        const createData = await createRes.json();
        if (!createRes.ok) throw new Error(`Create failed: ${createData.message}`);
        console.log('Product created:', createData.product.name);
        createdProductId = createData.product._id;

        // 3. Get All Products
        console.log('\nTesting Get All Products...');
        const getAllRes = await fetch(`${BASE_URL}/products`, {
            headers: { 'Authorization': `Bearer ${staffToken}` }
        });
        const products = await getAllRes.json();
        console.log(`Retrieved ${products.length} products`);
        const found = products.find(p => p._id === createdProductId);
        if (!found) throw new Error('Created product not found in list');
        console.log('Status of created product:', found.status);

        // 4. Update Product (Admin)
        console.log('\nTesting Update Product (Admin)...');
        const updateRes = await fetch(`${BASE_URL}/products/${createdProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ price: 150 })
        });
        const updateData = await updateRes.json();
        if (!updateRes.ok) throw new Error(`Update failed: ${updateData.message}`);
        console.log('Product updated, new price:', updateData.price);

        // 5. Staff Update (Should Fail)
        console.log('\nTesting Update Product (Staff) - Should Fail...');
        const staffUpdateRes = await fetch(`${BASE_URL}/products/${createdProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${staffToken}`
            },
            body: JSON.stringify({ price: 200 })
        });
        if (staffUpdateRes.status === 401 || staffUpdateRes.status === 403) {
            console.log('Staff update blocked as expected');
        } else {
            throw new Error(`Staff update should have failed, got ${staffUpdateRes.status}`);
        }

        // 6. Test Low Stock Logic
        console.log('\nTesting Stock Alert Logic...');
        await fetch(`${BASE_URL}/products/${createdProductId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ quantity: 5, reorderLevel: 10 })
        });

        const lowStockRes = await fetch(`${BASE_URL}/products/${createdProductId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const lowStockData = await lowStockRes.json();
        console.log(`Quantity: ${lowStockData.quantity}, ReorderLevel: ${lowStockData.reorderLevel}`);
        console.log(`Status: ${lowStockData.status}`);
        if (lowStockData.status !== 'LOW_STOCK') throw new Error('Stock alert logic failed');

        // 7. Delete Product (Admin)
        console.log('\nTesting Delete Product (Admin)...');
        const deleteRes = await fetch(`${BASE_URL}/products/${createdProductId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        if (!deleteRes.ok) throw new Error('Delete failed');
        console.log('Product deleted');

        console.log('\nAll verification tests passed!');

    } catch (error) {
        console.error('\nTest Failed:', error.message);
    }
}

runTests();
