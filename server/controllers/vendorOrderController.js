// server/controllers/vendorOrderController.js
const VendorOrder = require('../models/VendorOrder');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const StoreSettings = require('../models/StoreSettings');
const User = require('../models/User');
const { generateInvoicePDF } = require('../utils/pdfService');
const { sendEmail } = require('../utils/emailService');
const { sendWhatsAppMessage } = require('../utils/whatsappService');

// @desc    Place Order
// @route   POST /api/vendor-orders
// @access  Private/Admin
const placeOrder = async (req, res) => {
    try {
        const { product, vendor, quantity, deliveryAddress } = req.body;

        if (!deliveryAddress) {
            return res.status(400).json({ message: 'Delivery address is required' });
        }

        // Validations
        const foundProduct = await Product.findOne({ _id: product, userId: req.user.id });
        if (!foundProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const foundVendor = await Vendor.findOne({ _id: vendor, userId: req.user.id });
        if (!foundVendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const storeSettings = await StoreSettings.findOne();
        const storeName = storeSettings ? storeSettings.storeName : 'KiranaSmart';

        const vendorOrder = await VendorOrder.create({
            userId: req.user.id,
            product,
            productName: foundProduct.name,
            vendor,
            vendorName: foundVendor.name,
            vendorEmail: foundVendor.email || '',
            vendorPhone: foundVendor.phone || '',
            quantity,
            deliveryAddress
        });

        // Generate PDF Invoice and Send Notifications in the background so the UI doesn't hang
        const orderData = {
            storeName: storeName,
            vendorName: foundVendor.name,
            productName: foundProduct.name,
            quantity,
            unitPrice: foundProduct.price || 0,
            total: quantity * (foundProduct.price || 0),
            deliveryAddress: deliveryAddress,
            orderDate: vendorOrder.orderDate
        };

        // Fire and forget
        Promise.resolve().then(async () => {
            let pdfPath = null;
            try {
                pdfPath = await generateInvoicePDF(orderData);
                vendorOrder.invoiceFileUrl = pdfPath;
                await vendorOrder.save();
            } catch (pdfErr) {
                console.error('Failed to generate PDF:', pdfErr);
            }

            // Send Email
            const emailText = `Hello ${foundVendor.name},\n\nA new order has been placed.\n\nProduct: ${foundProduct.name}\nQuantity: ${quantity}\nDelivery Address: ${deliveryAddress}\n\nPlease find the attached invoice.\n\nThank you,\n${storeName}`;

            if (foundVendor.email) {
                try {
                    await sendEmail({
                        to: foundVendor.email,
                        subject: `New Vendor Order from ${storeName}`,
                        text: emailText,
                        attachmentPath: pdfPath
                    });
                } catch (emailErr) {
                    console.error('Failed to send email:', emailErr);
                }
            }

            // Send WhatsApp
            if (foundVendor.phone) {
                const waMsg = `New Order from ${storeName}\n\nProduct: ${foundProduct.name}\nQuantity: ${quantity}\nDelivery Address: ${deliveryAddress}\n\nInvoice has been sent to your email.`;
                try {
                    await sendWhatsAppMessage({
                        to: foundVendor.phone.startsWith('whatsapp:') ? foundVendor.phone : `whatsapp:+91${foundVendor.phone.replace(/\D/g, '').slice(-10)}`, // Basic Indian format fallback if raw
                        body: waMsg
                    });
                } catch (waErr) {
                    console.error('Failed to send WhatsApp:', waErr);
                }
            }
        }).catch(err => console.error('Background Notification Process Error:', err));

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
