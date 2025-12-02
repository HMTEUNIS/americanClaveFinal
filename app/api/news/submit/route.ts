import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// TODO: Replace with actual Cloudflare API integration
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allowedEmails = ['hmteunis4@gmail.com', 'americanclaveuser@gmail.com'];
    if (!allowedEmails.includes(session.user.email)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // TODO: Upload to Cloudflare DB/Storage
    // This is a placeholder - replace with actual Cloudflare API calls
    console.log('News post to upload:', { title, content });

    // Simulate API call
    // const response = await fetch('YOUR_CLOUDFLARE_API_ENDPOINT', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ title, content }),
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'News post submitted successfully (placeholder - Cloudflare integration pending)' 
    });
  } catch (error) {
    console.error('Error submitting news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

