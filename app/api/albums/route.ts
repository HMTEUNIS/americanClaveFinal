import { NextResponse } from 'next/server';
import { fetchAlbums } from '@/lib/d1-worker';

/**
 * API Route to fetch all albums from Cloudflare D1
 * 
 * This endpoint calls the D1 worker and returns all albums.
 * Can be called from client components.
 */

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const purchasableOnly = searchParams.get('purchasable') === 'true';
    
    const albums = await fetchAlbums();
    
    // Filter for purchasable albums if requested
    if (purchasableOnly) {
      const purchasable = albums.filter((album: any) => album.availableForPurchase === true);
      return NextResponse.json(purchasable);
    }
    
    return NextResponse.json(albums);
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}

