const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a PDF reorder invoice.
 * @param {Object} orderData - Reorder order details
 * @returns {Promise<string>} - Resolves with absolute path to the generated PDF
 */
const generateReorderInvoice = (orderData) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const fileName = `reorderInvoice_${orderData.orderId || Date.now()}.pdf`;

            // Ensure a temp directory exists
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            const filePath = path.join(tempDir, fileName);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text('KiranaSmart', { align: 'center' }); // Ensure 'KiranaSmart' as requested
            if (orderData.storeName && orderData.storeName !== 'KiranaSmart') {
                doc.fontSize(14).text(`Store Name: ${orderData.storeName}`, { align: 'center' });
            }
            doc.moveDown(0.5);
            doc.fontSize(16).text('Reorder Invoice', { align: 'center' });
            doc.moveDown();

            // Order Details
            doc.fontSize(12).font('Helvetica-Bold').text('Order Details');
            doc.font('Helvetica');
            doc.text(`Reorder Order ID: ${orderData.orderId}`);
            doc.text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`);
            doc.moveDown();

            // Vendor Details
            doc.font('Helvetica-Bold').text('Vendor Details');
            doc.font('Helvetica');
            doc.text(`Vendor Name: ${orderData.vendorName}`);
            doc.text(`Vendor Email: ${orderData.vendorEmail}`);
            doc.moveDown();

            // Product Table Header
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            
            doc.font('Helvetica-Bold');
            doc.text('Product Name', 50, doc.y, { width: 250, continued: true });
            doc.text('Category', 300, doc.y, { width: 150, continued: true });
            doc.text('Requested', 450, doc.y, { width: 100, align: 'right' });
            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);

            // Product Table Row
            doc.font('Helvetica');
            doc.text(orderData.productName, 50, doc.y, { width: 250, continued: true });
            doc.text(orderData.category || 'N/A', 300, doc.y, { width: 150, continued: true });
            doc.text(String(orderData.quantity), 450, doc.y, { width: 100, align: 'right' });
            doc.moveDown();

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(2);

            // Footer
            const contactInfo = [orderData.storeEmail, orderData.storeContact].filter(Boolean).join(' | ');
            if (contactInfo) {
                doc.text(`Store Contact: ${contactInfo}`, { align: 'center' });
            }
            doc.text('Generated automatically by KiranaSmart', { align: 'center' });

            doc.end();

            stream.on('finish', () => {
                // Return exactly the file path (absolute path) so it can be attached to the email.
                resolve(filePath);
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
    generateReorderInvoice
};
