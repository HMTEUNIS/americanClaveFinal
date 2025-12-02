import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const stripe = getStripe();
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // TODO: Verify purchase exists in Cloudflare DB
    // This ensures the purchase was recorded correctly
    // const purchase = await fetch('YOUR_CLOUDFLARE_DB_ENDPOINT', {
    //   method: 'GET',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    //   },
    //   params: { sessionId },
    // });

    // Generate secure download URL
    // In production, this should be a signed URL from Cloudflare R2
    // that expires after a certain time period
    const albumTitle = session.metadata?.albumTitle || 'Unknown Album';
    const albumId = session.metadata?.albumId || '';

    // TODO: Replace with actual Cloudflare R2 signed URL generation
    // For now, this is a placeholder
    // const downloadUrl = await generateSignedUrl(albumId);
    
    // Placeholder: In production, generate a signed URL from Cloudflare R2
    const downloadUrl = `/api/download/${sessionId}?albumId=${encodeURIComponent(albumId)}`;

    return NextResponse.json({
      success: true,
      albumTitle,
      downloadUrl,
    });
  } catch (error) {
    console.error('Error verifying purchase:', error);
    return NextResponse.json(
      { error: 'Failed to verify purchase' },
      { status: 500 }
    );
  }
}

