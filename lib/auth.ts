import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Get the secret from environment variables
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

// For development, use a default secret if none is provided
// In production, this should be set via environment variables
// Ensure secret is always a non-empty string
const secret = authSecret || 'dev-secret-change-in-production-please-set-auth-secret-in-production';

// Warn if secret is missing in production
if (!authSecret && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: AUTH_SECRET is not set. Authentication may not work in production.');
}

// Debug: Log secret status (without exposing the actual secret)
if (process.env.NODE_ENV === 'development') {
  console.log('[Auth] Secret is set:', !!secret && secret.length > 0);
  console.log('[Auth] Using environment secret:', !!authSecret);
}

// Configure NextAuth with secret always set
const authConfig = {
  secret: secret, // Always set a secret to avoid MissingSecret error
  trustHost: true, // Required for Vercel deployment
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user }: { user: any }) {
      // Only allow specific email addresses
      const allowedEmails = ['hmteunis4@gmail.com', 'americanclaveuser@gmail.com'];
      if (user.email && allowedEmails.includes(user.email)) {
        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: '/newsadmin',
    error: '/newsadmin',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

