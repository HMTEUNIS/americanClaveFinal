import { NextResponse } from 'next/server';
import { fetchAlbumsByPlayerId, fetchPlayerBySlug } from '@/lib/d1-worker';

interface PlayerAlbumsRouteProps {
  params: Promise<{ slug: string }>;
}

/**
 * API Route to fetch all albums for a player using album_players junction table
 * 
 * This endpoint accepts a player slug, fetches the player to get their ID,
 * then returns all albums the player appeared on.
 */

export async function GET(request: Request, { params }: PlayerAlbumsRouteProps) {
  try {
    const { slug } = await params;
    
    // Fetch player by slug - the worker already includes albums in the response
    const player = await fetchPlayerBySlug(slug);
    
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }
    
    // Extract albums from the player response (worker returns player with albums nested)
    const albums = player.albums || [];
    
    return NextResponse.json(albums);
    
  } catch (error) {
    console.error('Error fetching albums for player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums for player' },
      { status: 500 }
    );
  }
}
