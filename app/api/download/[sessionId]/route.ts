import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';

interface DownloadRouteProps {
  params: Promise<{ sessionId: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: DownloadRouteProps
) {
  try {
    const stripe = getStripe();
    const { sessionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const albumId = searchParams.get('albumId');

    if (!sessionId || !albumId) {
      return NextResponse.json(
        { error: 'Session ID and album ID are required' },
        { status: 400 }
      );
    }

    // Verify the session was paid
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 403 }
      );
    }

    // Verify the album ID matches the session metadata
    if (session.metadata?.albumId !== albumId) {
      return NextResponse.json(
        { error: 'Album ID mismatch' },
        { status: 403 }
      );
    }

    // TODO: Verify purchase in Cloudflare DB
    // This adds an extra layer of security
    // const purchase = await verifyPurchaseInDB(sessionId, albumId);

    // TODO: Get the actual WAV file from Cloudflare R2
    // This should generate a signed URL or stream the file directly
    // For now, this is a placeholder that would redirect to the actual file
    
    // In production, you would:
    // 1. Get the file from Cloudflare R2 using the albumId
    // 2. Stream it directly or generate a signed URL
    // 3. Set appropriate headers for file download
    
    // Placeholder: Return a redirect to the actual file location
    // Replace this with actual Cloudflare R2 file retrieval
    const cloudflareWavUrl = `https://cloudflare-r2.example.com/albums/${albumId}.wav`;
    
    // For now, return the URL (in production, stream the file or use signed URLs)
    return NextResponse.redirect(cloudflareWavUrl);

    // Production example (streaming):
    // const fileResponse = await fetch(cloudflareWavUrl, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CLOUDFLARE_R2_TOKEN}`,
    //   },
    // });
    // 
    // return new NextResponse(fileResponse.body, {
    //   headers: {
    //     'Content-Type': 'audio/wav',
    //     'Content-Disposition': `attachment; filename="album-${albumId}.wav"`,
    //   },
    // });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve download' },
      { status: 500 }
    );
  }
}

