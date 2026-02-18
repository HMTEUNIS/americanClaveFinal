import { NextResponse } from 'next/server';
import { fetchAlbumById, fetchAlbumBySlug } from '@/lib/d1-worker';
import { getAllAlbumCoverUrls } from '@/lib/r2-images';

interface AlbumDetailRouteProps {
  params: Promise<{ id: string }>;
}

/**
 * API Route to fetch a single album by ID or slug from Cloudflare D1
 * 
 * This endpoint calls the D1 worker and returns album data with R2 image URLs.
 * Supports both numeric IDs and slug-based lookups.
 */

export async function GET(request: Request, { params }: AlbumDetailRouteProps) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    
    // Check if it's a numeric ID
    const albumId = parseInt(decodedId, 10);
    let albumData: any = null;
    
    if (!isNaN(albumId)) {
      // Fetch by ID
      albumData = await fetchAlbumById(albumId);
    } else {
      // Fetch by slug
      albumData = await fetchAlbumBySlug(decodedId);
    }
    
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