import { NextResponse } from 'next/server';
import { fetchPlayerBySlug } from '@/lib/d1-worker';

interface PlayerDetailRouteProps {
  params: Promise<{ slug: string }>;
}

/**
 * API Route to fetch a single player by slug from Cloudflare D1
 * 
 * This endpoint calls the D1 worker and returns player data.
 */

export async function GET(request: Request, { params }: PlayerDetailRouteProps) {
  try {
    const { slug } = await params;
    
    // Fetch player data from D1 worker
    const playerData = await fetchPlayerBySlug(slug);
    
    if (!playerData) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    return NextResponse.json(playerData);
    
  } catch (error) {
    console.error('Error fetching player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch player' },
      { status: 500 }
    );
  }
}

