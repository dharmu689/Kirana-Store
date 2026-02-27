import { useState, useEffect } from 'react';
import productService from '../services/productService';
import salesService from '../services/salesService';

const SaleForm = ({ onSaleAdded }) => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product: '',
        quantitySold: '',
        paymentMethod: 'Cash'
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            console.error('Failed to load products', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        if (name === 'product') {
            const product = products.find((p) => p._id === value);
            setSelectedProduct(product);
            // Reset quantity if product changes
            setFormData((prev) => ({
                ...prev,
                quantitySold: '',
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedProduct) {
            setError('Please select a product');
            return;
        }

        if (selectedProduct.quantity <= 0) {
            setError('Out of stock');
            return;
        }

        if (parseInt(formData.quantitySold) > selectedProduct.quantity) {
            setError(`Insufficient stock. Available: ${selectedProduct.quantity}`);
            return;
        }

        try {
            await salesService.createSale(formData);
            setSuccess('Sale recorded successfully!');
            setFormData({
                product: '',
                quantitySold: '',
                paymentMethod: 'Cash'
            });
            setSelectedProduct(null);
            if (onSaleAdded) onSaleAdded();
            // Reload products to get updated stock
            loadProducts();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record sale');
        }
    };

    const totalPrice = selectedProduct && formData.quantitySold
        ? ((selectedProduct.sellingPrice || selectedProduct.price) * formData.quantitySold).toFixed(2)
        : '0.00';

    return (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">New Sale</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
                    <select
                        name="product"
                        value={formData.product}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id} disabled={product.quantity <= 0}>
                                {product.name} - ₹{product.sellingPrice || product.price} (Stock: {product.quantity})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                    <input
                        type="number"
                        name="quantitySold"
                        value={formData.quantitySold}
                        onChange={handleChange}
                        min="1"
                        max={selectedProduct?.quantity}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={!selectedProduct}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment</label>
                    <select
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Submit (₹{totalPrice})
                </button>
            </form>
        </div>
    );
};

export default SaleForm;
