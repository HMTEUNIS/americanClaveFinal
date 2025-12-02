import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // TODO: Store purchase in Cloudflare DB
    // This should include:
    // - session.id (Stripe session ID)
    // - session.customer_email (customer email)
    // - session.metadata.albumTitle (album purchased)
    // - session.metadata.albumId (album ID)
    // - session.payment_status (should be 'paid')
    // - timestamp

    console.log('Purchase completed:', {
      sessionId: session.id,
      customerEmail: session.customer_email,
      albumTitle: session.metadata?.albumTitle,
      albumId: session.metadata?.albumId,
      amountTotal: session.amount_total,
    });

    // TODO: Replace with actual Cloudflare DB insert
    // await fetch('YOUR_CLOUDFLARE_DB_ENDPOINT', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     sessionId: session.id,
    //     customerEmail: session.customer_email,
    //     albumTitle: session.metadata?.albumTitle,
    //     albumId: session.metadata?.albumId,
    //     amountPaid: session.amount_total ? session.amount_total / 100 : 0,
    //     purchasedAt: new Date().toISOString(),
    //   }),
    // });
  }

  return NextResponse.json({ received: true });
}

