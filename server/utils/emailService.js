const nodemailer = require('nodemailer');

/**
 * Send an email with an optional attachment or HTML content.
 * Supports Resend API, SendGrid API, and standard Nodemailer SMTP.
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
        // 1. Try Resend API (HTTP-based, doesn't get blocked by Render port restrictions)
        if (process.env.RESEND_API_KEY) {
            console.log('[EMAIL SERVICE] Trying Resend API...');
            const fromEmail = process.env.RESEND_FROM || 'noreply@kiranasmart.dharmu689.me';
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: `KiranaStore <${fromEmail}>`,
                    to: [to],
                    subject: subject,
                    text: text,
                    html: html
                }),
                signal: AbortSignal.timeout(5000)
            });

            const data = await response.json();
            if (response.ok) {
                console.log(`[EMAIL SERVICE] Email sent via Resend API. ID: ${data.id}`);
                return { success: true, provider: 'resend', messageId: data.id };
            } else {
                console.error('[EMAIL SERVICE] Resend API returned error:', data);
                throw new Error(data.message || 'Resend API failed');
            }
        }

        // 2. Try SendGrid API (HTTP-based, doesn't get blocked by Render port restrictions)
        if (process.env.SENDGRID_API_KEY) {
            console.log('[EMAIL SERVICE] Trying SendGrid API...');
            const fromEmail = process.env.SENDGRID_FROM || 'noreply@kiranasmart.dharmu689.me';
            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [{ to: [{ email: to }] }],
                    from: { email: fromEmail, name: 'KiranaStore' },
                    subject: subject,
                    content: [
                        { type: 'text/plain', value: text },
                        ...(html ? [{ type: 'text/html', value: html }] : [])
                    ]
                }),
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                console.log('[EMAIL SERVICE] Email sent via SendGrid API successfully.');
                return { success: true, provider: 'sendgrid' };
            } else {
                const data = await response.json();
                console.error('[EMAIL SERVICE] SendGrid API returned error:', data);
                throw new Error(data.errors?.[0]?.message || 'SendGrid API failed');
            }
        }

        // 3. Fallback to Nodemailer SMTP (default behavior)
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

        console.log('[EMAIL SERVICE] Trying Nodemailer SMTP...');
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
            },
            connectionTimeout: 5000, // 5 seconds connection timeout
            greetingTimeout: 5000,   // 5 seconds greeting timeout
            socketTimeout: 5000      // 5 seconds socket inactivity timeout
        });

        // Force the socket to always use IPv4 to avoid ENETUNREACH IPv6 crash.
        transporter.getSocket = function (options, callback) {
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
        console.log('[EMAIL SERVICE] Email sent via SMTP: %s', info.messageId);
        return { success: true, provider: 'smtp', messageId: info.messageId };
    } catch (error) {
        console.error('[EMAIL SERVICE] Failed to send email:', error.message);

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
