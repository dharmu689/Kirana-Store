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

            const isDev = process.env.NODE_ENV !== 'production';

            // Developer fallback for testing locally when GOOGLE_CLIENT_ID is not configured (disabled in production)
            if (isDev && (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') && idToken.startsWith('test-token-')) {
                const tokenVal = idToken.replace('test-token-', '');
                let email, name;
                if (tokenVal.includes('@')) {
                    email = tokenVal;
                    const prefix = tokenVal.split('@')[0];
                    name = prefix.split(/[\._-]/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') + ' Google';
                } else {
                    email = `${tokenVal}@gmail.com`;
                    name = tokenVal.charAt(0).toUpperCase() + tokenVal.slice(1) + ' Google';
                }
                const googleUser = {
                    googleId: `google-id-${tokenVal}`,
                    email: email,
                    name: name,
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
                // Another development mock fallback for standard token (disabled in production)
                if (isDev && (!CLIENT_ID || CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') && idToken === 'development-test-token') {
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
