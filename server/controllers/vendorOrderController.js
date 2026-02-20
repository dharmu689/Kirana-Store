// server/controllers/vendorOrderController.js
const VendorOrder = require('../models/VendorOrder');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Place Order
// @route   POST /api/vendor-orders
// @access  Private/Admin
const placeOrder = async (req, res) => {
    try {
        const { product, vendor, quantity, deliveryAddress } = req.body;

        // Validations
        const foundProduct = await Product.findById(product);
        if (!foundProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const foundVendor = await Vendor.findById(vendor);
        if (!foundVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const vendorOrder = await VendorOrder.create({
            product,
            vendor,
            quantity,
            deliveryAddress
        });

        res.status(201).json(vendorOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get All Orders
// @route   GET /api/vendor-orders
// @access  Private
const getOrders = async (req, res) => {
    try {
        const orders = await VendorOrder.find({})
            .populate('product', 'name price')
            .populate('vendor', 'name contactPerson phone')
            .sort('-createdAt');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Order Status
// @route   PUT /api/vendor-orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Approved', 'Delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await VendorOrder.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Prevent updating if already delivered
        if (order.status === 'Delivered') {
            return res.status(400).json({ message: 'Order is already delivered' });
        }

        order.status = status;

        // If status becomes Delivered, increase product quantity
        if (status === 'Delivered') {
            const product = await Product.findById(order.product);
            if (product) {
                product.quantity += order.quantity;
                await product.save();
            }
        }

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    placeOrder,
    getOrders,
    updateOrderStatus
};
