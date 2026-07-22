const nodemailer = require('nodemailer');

/**
 * Send an email with an optional attachment or HTML content.
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Email body text
 * @param {string} [options.html] - Optional HTML email body
 * @param {string} [options.attachmentPath] - Path to file attachment
 */
// Force IPv4 locally for Node 18+ to avoid ENETUNREACH on broken IPv6 routes
if (typeof require('dns').setDefaultResultOrder === 'function') {
    require('dns').setDefaultResultOrder('ipv4first');
}

const sendEmail = async ({ to, subject, text, html, attachmentPath }) => {
    try {
        // If credentials are not set up, go straight to fallback
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('=============== DEVELOPMENT MAIL FALLBACK (Credentials Missing) ===============');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Text: ${text}`);
            if (html) {
                console.log(`HTML: ${html}`);
            }
            console.log('==============================================================================');
            return { success: true, fallback: true };
        }

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false, // use STARTTLS (not SSL)
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Force the socket to always use IPv4 to avoid ENETUNREACH IPv6 crash.
        transporter.getSocket = function(options, callback) {
            options.family = 4; // Force IPv4
            return require('net').connect(options, callback);
        };

        const mailOptions = {
            from: `KiranaStore <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
        };

        if (html) {
            mailOptions.html = html;
        }

        if (attachmentPath) {
            mailOptions.attachments = [
                {
                    path: attachmentPath
                }
            ];
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        
        // Print to console so developer can verify the OTP or email text
        console.log('=============== DEVELOPMENT MAIL FALLBACK (Send Failure) ===============');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Text: ${text}`);
        if (html) {
            console.log(`HTML: ${html}`);
        }
        console.log('========================================================================');
        
        return { success: true, fallback: true, error: error.message };
    }
};

module.exports = {
    sendEmail
};

