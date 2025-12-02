import { NextResponse } from 'next/server';
import { fetchPlayers } from '@/lib/d1-worker';

/**
 * API Route to fetch all players from Cloudflare D1
 * 
 * This endpoint calls the D1 worker and returns all players.
 * Can be called from client components.
 */

export async function GET() {
  try {
    const players = await fetchPlayers();
    return NextResponse.json(players);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

