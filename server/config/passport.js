const passport = require('passport');
const CustomStrategy = require('passport-custom').Strategy;
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

passport.use('google-id-token', new CustomStrategy(
    async function(req, done) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return done(null, false, { message: 'No Google idToken provided' });
            }

            // Developer fallback for testing locally when GOOGLE_CLIENT_ID is not configured
            if ((!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') && idToken.startsWith('test-token-')) {
                const username = idToken.replace('test-token-', '');
                const googleUser = {
                    googleId: `google-id-${username}`,
                    email: `${username}@gmail.com`,
                    name: username.charAt(0).toUpperCase() + username.slice(1) + ' Google',
                    picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                };
                return done(null, googleUser);
            }

            let payload;
            try {
                const ticket = await client.verifyIdToken({
                    idToken: idToken,
                    audience: CLIENT_ID,
                });
                payload = ticket.getPayload();
            } catch (err) {
                // Another development mock fallback for standard token
                if ((!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') && idToken === 'development-test-token') {
                    payload = {
                        sub: 'dev-google-id-123456',
                        email: 'dev-google-user@example.com',
                        name: 'Dev Google User',
                        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
                    };
                } else {
                    return done(err, false, { message: `Google verification failed: ${err.message}` });
                }
            }

            if (!payload) {
                return done(null, false, { message: 'Google authentication payload invalid' });
            }

            const googleUser = {
                googleId: payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
            };

            return done(null, googleUser);
        } catch (error) {
            console.error('Passport Google Custom Strategy Error:', error);
            return done(error);
        }
    }
));

module.exports = passport;
