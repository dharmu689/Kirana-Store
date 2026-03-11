const { Resend } = require('resend');
const fs = require('fs');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send vendor reorder email with PDF attachment.
 * @param {string} vendorEmail - Vendor's email address
 * @param {Object} reorderData - Details about the reorder
 * @param {string} pdfPath - Absolute path to the generated PDF
 */
const sendVendorReorderEmail = async (vendorEmail, reorderData, pdfPath) => {
    try {
        const storeName = reorderData.storeName || 'KiranaSmart';
        const subject = `New Reorder Request – ${storeName}`;

        const text = `Hello ${reorderData.vendorName},

A reorder request has been generated from our store for the following product.

Product Name: ${reorderData.productName}
Requested Quantity: ${reorderData.quantity}

${pdfPath ? 'Please find the attached reorder invoice for detailed information.' : 'Kindly note: the automated invoice attachment was not generated, but the order request remains valid.'}

Thank you,
${storeName} Store`;

        const attachmentList = [];
        if (pdfPath && fs.existsSync(pdfPath)) {
            const fileContent = fs.readFileSync(pdfPath);
            attachmentList.push({
                filename: `Invoice_${reorderData.orderId || 'Reorder'}.pdf`,
                content: fileContent
            });
        }

        const data = await resend.emails.send({
            from: `KiranaSmart <onboarding@resend.dev>`, // Resend testing domain
            to: [vendorEmail],
            subject: subject,
            text: text,
            attachments: attachmentList.length > 0 ? attachmentList : undefined
        });

        console.log('Vendor reorder email sent via Resend:', data);
        return data;
    } catch (error) {
        console.error('Error sending vendor reorder email via Resend:', error);
        throw error;
    }
};

module.exports = {
    sendVendorReorderEmail
};
