const nodemailer = require('nodemailer');

/**
 * Send vendor reorder email with PDF attachment.
 * @param {string} vendorEmail - Vendor's email address
 * @param {Object} reorderData - Details about the reorder
 * @param {string} pdfPath - Absolute path to the generated PDF
 */
const sendVendorReorderEmail = async (vendorEmail, reorderData, pdfPath) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const storeName = reorderData.storeName || 'KiranaSmart';
        const subject = `New Reorder Request – ${storeName}`;

        const text = `Hello ${reorderData.vendorName},

A reorder request has been generated from our store for the following product.

Product Name: ${reorderData.productName}
Requested Quantity: ${reorderData.quantity}

${pdfPath ? 'Please find the attached reorder invoice for detailed information.' : 'Kindly note: the automated invoice attachment was not generated, but the order request remains valid.'}

Thank you,
${storeName} Store`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: vendorEmail,
            subject: subject,
            text: text
        };

        if (pdfPath) {
            mailOptions.attachments = [
                {
                    path: pdfPath
                }
            ];
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Vendor reorder email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending vendor reorder email:', error);
        throw error; // Or handle as per requirement, controller logs it
    }
};

module.exports = {
    sendVendorReorderEmail
};
