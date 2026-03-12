const nodemailer = require('nodemailer');

/**
 * Send an email with an optional attachment.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email body text
 * @param {string} [options.attachmentPath] - Path to file attachment
 */
const sendEmail = async ({ to, subject, text, attachmentPath }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `Kirana Store <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
        };

        if (attachmentPath) {
            mailOptions.attachments = [
                {
                    path: attachmentPath
                }
            ];
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendEmail
};
