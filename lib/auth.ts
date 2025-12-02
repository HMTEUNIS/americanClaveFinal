import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Get the secret from environment variables
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

// For development, use a default secret if none is provided
// In production, this should be set via environment variables
const secret = authSecret || (process.env.NODE_ENV === 'development' ? 'dev-secret-change-in-production' : undefined);

// Warn if secret is missing in production
if (!authSecret && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: AUTH_SECRET is not set. Authentication may not work in production.');
}

// Only configure NextAuth if we have a secret or we're in development
const authConfig: any = {
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

// Only add secret if it's defined
if (secret) {
  authConfig.secret = secret;
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

