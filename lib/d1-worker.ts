/**
 * Cloudflare D1 Worker Client
 */

const D1_WORKER_URL = process.env.D1_WORKER_URL || 'https://d1-worker.americanclaveuser.workers.dev';

/**
 * Fetch all players
 */
export async function fetchPlayers(): Promise<any[]> {
  const response = await fetch(`${D1_WORKER_URL}/players`);
  if (!response.ok) throw new Error(`Failed to fetch players: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch a single player by ID with their albums
 */
export async function fetchPlayerById(id: number | string): Promise<any | null> {
  const response = await fetch(`${D1_WORKER_URL}/players/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch player: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch a single player by slug (fetches all and matches)
 */
export async function fetchPlayerBySlug(slug: string): Promise<any | null> {
  const players = await fetchPlayers();
  const { generatePlayerSlug } = await import('@/lib/utils');
  const player = players.find(p => generatePlayerSlug(p.name) === slug);
  if (!player) return null;
  return fetchPlayerById(player.id);
}

/**
 * Fetch all albums
 */
export async function fetchAlbums(): Promise<any[]> {
  const response = await fetch(`${D1_WORKER_URL}/albums`);
  if (!response.ok) throw new Error(`Failed to fetch albums: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch a single album by ID
 */
export async function fetchAlbumById(id: number | string): Promise<any | null> {
  const response = await fetch(`${D1_WORKER_URL}/albums/${id}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch album: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch a single album by slug from D1 worker
 * The worker endpoint handles case-insensitive slug matching
 */
export async function fetchAlbumBySlugFromWorker(slug: string): Promise<any | null> {
  try {
    const response = await fetch(`${D1_WORKER_URL}/albums/slug/${encodeURIComponent(slug)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch album by slug: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching album by slug from worker:', error);
    return null;
  }
}

/**
 * Fetch a single album by slug
 * Tries worker endpoint first, falls back to client-side matching
 * Also supports numeric IDs for backwards compatibility
 */
export async function fetchAlbumBySlug(slug: string): Promise<any | null> {
  try {
    // If slug is a number, treat it as an ID (backwards compatibility)
    const numericId = parseInt(slug, 10);
    if (!isNaN(numericId)) {
      return fetchAlbumById(numericId);
    }
    
    // Try worker endpoint first
    const albumFromWorker = await fetchAlbumBySlugFromWorker(slug);
    if (albumFromWorker) {
      return albumFromWorker;
    }
    
    // Fallback to client-side matching
    const albums = await fetchAlbums();
    const { generateAlbumSlug } = await import('@/lib/utils');
    
    const album = albums.find(a => {
      const albumSlug = generateAlbumSlug(a.title);
      return albumSlug === slug || albumSlug.toLowerCase() === slug.toLowerCase();
    });
    
    if (!album) return null;
    return fetchAlbumById(album.id);
  } catch (error) {
    console.error('Error fetching album by slug:', error);
    return null;
  }
}

/**
 * Fetch all players for an album
 */
export async function fetchPlayersByAlbumId(albumId: number | string): Promise<any[]> {
  const response = await fetch(`${D1_WORKER_URL}/albums/${albumId}/players`);
  if (!response.ok) return [];
  return response.json();
}

/**
 * Fetch all albums for a player using album_players junction table
 * Uses the /players/:id endpoint which already includes albums in the response
 */
export async function fetchAlbumsByPlayerId(playerId: number | string): Promise<any[]> {
  // The worker's /players/:id endpoint returns player with albums nested
  const player = await fetchPlayerById(playerId);
  if (!player) return [];
  // Extract albums from the player response
  return player.albums || [];
}

/**
 * Fetch complete album page with players
 */
export async function fetchAlbumPage(albumId: number | string): Promise<any | null> {
  const response = await fetch(`${D1_WORKER_URL}/album_page/${albumId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch album page: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch complete player page with albums
 */
export async function fetchPlayerPage(playerId: number | string): Promise<any | null> {
  const response = await fetch(`${D1_WORKER_URL}/player_page/${playerId}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to fetch player page: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch album_players junction records with optional filters
 */
export async function fetchAlbumPlayers(filters?: { album_id?: number, player_id?: number }): Promise<any[]> {
  let url = `${D1_WORKER_URL}/album_players`;
  if (filters) {
    const params = new URLSearchParams();
    if (filters.album_id) params.set('album_id', String(filters.album_id));
    if (filters.player_id) params.set('player_id', String(filters.player_id));
    url += `?${params.toString()}`;
  }
  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
}