# Environment Variables for Vercel Deployment

Set these environment variables in your Vercel project settings:

## Required for Authentication
- `AUTH_SECRET` - Secret key for NextAuth.js (generate a random string, or use `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `NEXTAUTH_URL` - Your production URL (e.g., `https://your-domain.vercel.app`)

## Required for Data Fetching
- `D1_WORKER_URL` - Your Cloudflare D1 worker URL (default: `https://d1-worker.americanclaveuser.workers.dev`)
- `NEXT_PUBLIC_R2_PUBLIC_URL` - Your Cloudflare R2 public URL (default: `https://pub-2e173b57501f46d1b35ca8b2b67e30e6.r2.dev`)

## Optional (for Stripe/Payment features)
- `STRIPE_SECRET_KEY` - Stripe secret key (if using payment features)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (if using webhooks)

## How to Set in Vercel:
1. Go to your project in Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with its value
4. Make sure to set them for "Production", "Preview", and "Development" as needed
5. Redeploy after adding variables

