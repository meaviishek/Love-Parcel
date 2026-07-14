import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleLoginService } from '../modules/auth/service/googleLogin.service.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,

        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userData = {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos[0].value,
                };

                const { user } = await googleLoginService(userData);
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Optional: Serialize and deserialize if using sessions (not needed for JWT, but passport might require it for some configs)
// For stateless JWT, we usually don't need persistent sessions, but passport might complain if not handled.
// However, since we are handling the response immediately in the callback, we might skip session usage.

export default passport;
