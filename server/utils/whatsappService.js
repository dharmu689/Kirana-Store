const twilio = require('twilio');

/**
 * Send a WhatsApp message using Twilio.
 * @param {Object} options - Message options
 * @param {string} options.to - Recipient phone number in WhatsApp format (e.g., 'whatsapp:+1234567890')
 * @param {string} options.body - Message body
 */
const sendWhatsAppMessage = async ({ to, body }) => {
    try {
        // Fallback for empty creds so dev server doesn't crash if they just want to mock it.
        const accountSid = process.env.TWILIO_SID || 'mock_sid';
        const authToken = process.env.TWILIO_AUTH || 'mock_token';
        const fromNumber = process.env.TWILIO_WHATSAPP || 'whatsapp:+14155238886';

        // Do not attempt to send if mock_sid is used in production or if user didn't provide it
        if (accountSid === 'mock_sid') {
            console.log("Twilio credentials not found. Mocking WhatsApp message:");
            console.log(`To: ${to}\nBody: ${body}\nFrom: ${fromNumber}`);
            return { sid: 'mock_message_sid' };
        }

        const client = twilio(accountSid, authToken);

        const message = await client.messages.create({
            body: body,
            from: fromNumber,
            to: to
        });

        console.log('WhatsApp message sent: %s', message.sid);
        return message;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        throw error;
    }
};

module.exports = {
    sendWhatsAppMessage
};
