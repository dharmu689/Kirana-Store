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
            // Use A4 size for a modern look
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
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
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#333333').text('Order Details');
            doc.font('Helvetica').fillColor('#555555');
            doc.text(`Reorder Order ID: ${orderData.orderId}`);
            doc.text(`Date: ${new Date(orderData.orderDate).toLocaleDateString()}`);
            doc.moveDown();

            // Vendor Details
            doc.font('Helvetica-Bold').fillColor('#333333').text('Vendor Details');
            doc.font('Helvetica').fillColor('#555555');
            doc.text(`Vendor Name: ${orderData.vendorName}`);
            doc.text(`Vendor Email: ${orderData.vendorEmail}`);
            doc.moveDown(2);

            // Table styling constraints
            const tableTop = doc.y;
            const col1 = 50;  // Product Name
            const col2 = 300; // Category
            const col3 = 450; // Requested

            // Product Table Header backgrounds (Optional visual upgrade)
            doc.rect(50, tableTop - 5, 500, 20).fill('#f2f2f2');
            
            doc.fillColor('#333333').font('Helvetica-Bold');
            doc.text('Product Name', col1, tableTop, { width: 240, continued: false });
            doc.text('Category', col2, tableTop, { width: 140, continued: false });
            doc.text('Requested', col3, tableTop, { width: 100, align: 'right' });
            doc.moveDown(0.5);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#dddddd');
            doc.moveDown(1);

            // Product Table Row
            doc.font('Helvetica').fillColor('#555555');
            const rowY = doc.y;
            doc.text(orderData.productName, col1, rowY, { width: 240, continued: false });
            doc.text(orderData.category || 'N/A', col2, rowY, { width: 140, continued: false });
            doc.text(String(orderData.quantity), col3, rowY, { width: 100, align: 'right' });
            doc.moveDown(1);

            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#dddddd');
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
