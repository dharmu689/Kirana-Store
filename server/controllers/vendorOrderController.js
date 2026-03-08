// server/controllers/vendorOrderController.js
const VendorOrder = require('../models/VendorOrder');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { generateInvoicePDF } = require('../utils/pdfService');
const { sendEmail } = require('../utils/emailService');
const { sendWhatsAppMessage } = require('../utils/whatsappService');

// @desc    Place Order
// @route   POST /api/vendor-orders
// @access  Private/Admin
const placeOrder = async (req, res) => {
    try {
        const { product, vendor, quantity, deliveryAddress } = req.body;

        // Validations
        const foundProduct = await Product.findOne({ _id: product, userId: req.user.id });
        if (!foundProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const foundVendor = await Vendor.findOne({ _id: vendor, userId: req.user.id });
        if (!foundVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const vendorOrder = await VendorOrder.create({
            userId: req.user.id,
            product,
            vendor,
            quantity,
            deliveryAddress
        });

        // Generate PDF Invoice
        const orderData = {
            storeName: 'KiranaPro',
            vendorName: foundVendor.name,
            productName: foundProduct.name,
            quantity,
            unitPrice: foundProduct.price, // Assuming cost price is same as selling or simple price for now
            total: quantity * foundProduct.price,
            deliveryAddress: deliveryAddress || 'Store Location',
            orderDate: vendorOrder.orderDate
        };

        const pdfPath = await generateInvoicePDF(orderData);

        // Send Email
        const emailText = `Hello ${foundVendor.name},\n\nPlease find attached the purchase order from KiranaPro.\n\nProduct: ${foundProduct.name}\nQuantity: ${quantity}\nDelivery Address: ${orderData.deliveryAddress}\n\nThank you.`;

        // We catch errors independently so the order still succeeds even if notifications fail
        try {
            await sendEmail({
                to: 'rajaravana4@gmail.com', // Sending specifically to the requested email
                subject: 'New Purchase Order - KiranaPro',
                text: emailText,
                attachmentPath: pdfPath
            });
        } catch (emailErr) {
            console.error('Failed to send email:', emailErr);
        }

        // Send WhatsApp
        const waMsg = `New Order from KiranaPro\nProduct: ${foundProduct.name}\nQuantity: ${quantity}\nDelivery: ${orderData.deliveryAddress}`;
        try {
            await sendWhatsAppMessage({
                to: foundVendor.phone.startsWith('whatsapp:') ? foundVendor.phone : `whatsapp:${foundVendor.phone}`,
                body: waMsg
            });
        } catch (waErr) {
            console.error('Failed to send WhatsApp:', waErr);
        }

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
        const orders = await VendorOrder.find({ userId: req.user.id })
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
        const validStatuses = ['Pending', 'Delivered'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await VendorOrder.findOne({ _id: req.params.id, userId: req.user.id });

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
