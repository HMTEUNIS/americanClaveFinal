import { NextResponse } from 'next/server';
import { fetchAlbumById } from '@/lib/d1-worker';
import { getAllAlbumCoverUrls } from '@/lib/r2-images';

interface AlbumDetailRouteProps {
  params: Promise<{ id: string }>;
}

/**
 * API Route to fetch a single album by ID from Cloudflare D1
 * 
 * This endpoint calls the D1 worker and returns album data with R2 image URLs.
 */

export async function GET(request: Request, { params }: AlbumDetailRouteProps) {
  try {
    const { id } = await params;
    
    // Parse ID and validate
    const albumId = parseInt(id, 10);
    if (isNaN(albumId)) {
      return NextResponse.json({ error: 'Invalid album ID' }, { status: 400 });
    }
    
    // Fetch album data from D1 worker
    const albumData = await fetchAlbumById(albumId);
    
    if (!albumData) {
      return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    }
    
    // Generate R2 image URLs if catno is available
    let albumArtUrls: string[] = [];
    if (albumData.catno) {
      albumArtUrls = getAllAlbumCoverUrls(albumData.catno);
    }
    
    // Combine album data with R2 image URLs
    const combinedData = {
      ...albumData,
      albumArt: albumArtUrls,
    };
    
    return NextResponse.json(combinedData);
    
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { error: 'Failed to fetch album' },
      { status: 500 }
    );
  }
}