import { NextResponse } from 'next/server';
import { fetchPlayersByAlbumId } from '@/lib/d1-worker';

interface AlbumPlayersRouteProps {
  params: Promise<{ id: string }>;
}

/**
 * API Route to fetch all players for an album using album_players junction table
 * 
 * This endpoint calls the D1 worker and returns all players on the album.
 */

export async function GET(request: Request, { params }: AlbumPlayersRouteProps) {
  try {
    const { id } = await params;
    
    // Parse ID and validate
    const albumId = parseInt(id, 10);
    if (isNaN(albumId)) {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
    }
    
    // Fetch players for this album from D1 worker
    const players = await fetchPlayersByAlbumId(albumId);
    
    return NextResponse.json(players);
    
  } catch (error) {
    console.error('Error fetching players for album:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players for album' },
      { status: 500 }
    );
  }
}
