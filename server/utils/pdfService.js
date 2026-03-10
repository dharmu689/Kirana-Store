const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF invoice for a vendor order.
 * @param {Object} orderData - Details of the order
 * @param {string} orderData.storeName - Name of the store placing the order
 * @param {string} orderData.vendorName - Vendor name
 * @param {string} orderData.productName - Product name
 * @param {number} orderData.quantity - Quantity ordered
 * @param {number} orderData.unitPrice - Price per unit
 * @param {number} orderData.total - Total cost
 * @param {string} orderData.deliveryAddress - Address for delivery
 * @param {Date} orderData.orderDate - Date of order
 * @returns {Promise<string>} - Resolves with the path to the generated PDF
 */
const generateInvoicePDF = (orderData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `vendorOrder_${orderData.orderId || Date.now()}.pdf`;

            // Ensure a temp directory exists
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const filePath = path.join(tempDir, fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('Purchase Order Invoice', { align: 'center' });
            doc.moveDown();

            // Store Info
            doc.fontSize(12).text(`From: ${orderData.storeName}`);
            doc.text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`);
            doc.text(`Delivery Address: ${orderData.deliveryAddress || 'Store Location'}`);
            doc.moveDown();

            // Vendor Info
            doc.text(`To Vendor: ${orderData.vendorName}`);
            doc.moveDown();

            // Divider
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Order Details Table Header
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Product', 50, doc.y, { continued: true });
            doc.text('Quantity', 250, doc.y, { continued: true });
            doc.text('Unit Price', 350, doc.y, { continued: true });
            doc.text('Total', 450, doc.y);
            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Order Details Row
            doc.font('Helvetica');
            doc.text(orderData.productName, 50, doc.y, { continued: true });
            doc.text(String(orderData.quantity), 250, doc.y, { continued: true });
            doc.text(`Rs. ${orderData.unitPrice}`, 350, doc.y, { continued: true });
            doc.text(`Rs. ${orderData.total}`, 450, doc.y);
            doc.moveDown();

            // Divider
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Footer
            doc.text('Thank you for your business.', { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                const invoiceUrl = `/invoices/${fileName}`;
                resolve(invoiceUrl);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateInvoicePDF
};
