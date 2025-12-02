/**
 * Cloudflare D1 Worker Client
 * 
 * Helper functions to call the D1 worker at:
 * https://d1-worker.americanclaveuser.workers.dev/
 */

const D1_WORKER_URL = process.env.D1_WORKER_URL || 'https://d1-worker.americanclaveuser.workers.dev';

/**
 * Fetch all players from D1
 */
export async function fetchPlayers(): Promise<any[]> {
  try {
    const response = await fetch(`${D1_WORKER_URL}/players`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching players from D1 worker:', error);
    throw error;
  }
}

/**
 * Fetch all albums from D1
 */
export async function fetchAlbums(): Promise<any[]> {
  try {
    const response = await fetch(`${D1_WORKER_URL}/albums`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch albums: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching albums from D1 worker:', error);
    throw error;
  }
}

/**
 * Fetch a single album by ID from D1
 */
export async function fetchAlbumById(id: number | string): Promise<any | null> {
  try {
    const response = await fetch(`${D1_WORKER_URL}/albums/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch album: ${response.statusText}`);
    }

    const data = await response.json();
    // Worker returns an array with one album, extract it
    const album = Array.isArray(data) ? data[0] : data;
    
    // Console log to inspect data structure
    console.log('=== ALBUM DATA FROM D1 WORKER ===');
    console.log('Album ID:', id);
    console.log('Raw response:', JSON.stringify(data, null, 2));
    console.log('Extracted album:', JSON.stringify(album, null, 2));
    console.log('Album keys:', Object.keys(album || {}));
    console.log('track_list type:', typeof album?.track_list);
    console.log('track_list value:', album?.track_list);
    console.log('tracklist type:', typeof album?.tracklist);
    console.log('tracklist value:', album?.tracklist);
    console.log('players type:', typeof album?.players);
    console.log('players value:', album?.players);
    console.log('==================================');
    
    return album;
  } catch (error) {
    console.error('Error fetching album from D1 worker:', error);
    throw error;
  }
}

/**
 * Fetch a single album by slug from D1 (deprecated - use fetchAlbumById instead)
 * Kept for backwards compatibility if needed
 */
export async function fetchAlbumBySlug(slug: string): Promise<any | null> {
  try {
    // Fetch all albums and match by slug locally
    const albums = await fetchAlbums();
    
    // Import generateAlbumSlug for matching
    const { generateAlbumSlug } = await import('@/lib/utils');
    
    // Find the album that matches the slug
    const album = albums.find((album: any) => {
      const albumSlug = generateAlbumSlug(album.title);
      return albumSlug === slug;
    });
    
    if (!album) {
      return null;
    }
    
    // Return the album from the list
    return album;
  } catch (error) {
    console.error('Error fetching album from D1 worker:', error);
    throw error;
  }
}

/**
 * Fetch player_songs records for a specific album by album_id
 * This returns the junction table data linking players to songs on albums
 */
export async function fetchPlayerSongsByAlbumId(albumId: number | string): Promise<any[]> {
  try {
    const response = await fetch(`${D1_WORKER_URL}/albums/${albumId}/player-songs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Failed to fetch player-songs: ${response.statusText}`);
    }

    const data = await response.json();
    const playerSongs = Array.isArray(data) ? data : [];
    
    console.log('=== PLAYER_SONGS DATA FROM D1 WORKER ===');
    console.log('Album ID:', albumId);
    console.log('Player-songs fetched:', playerSongs.length);
    console.log('Player-songs data:', JSON.stringify(playerSongs, null, 2));
    console.log('========================================');
    
    return playerSongs;
  } catch (error) {
    console.error('Error fetching player-songs from D1 worker:', error);
    // Return empty array on error instead of throwing
    return [];
  }
}

/**
 * Fetch album page data from the new /album_page/:id endpoint
 * This returns album info and all players with their roles and song names
 */
export async function fetchAlbumPage(albumId: number | string): Promise<any | null> {
  try {
    const response = await fetch(`${D1_WORKER_URL}/album_page/${albumId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch album page: ${response.statusText}`);
    }

    const data = await response.json();
    
    console.log('=== ALBUM PAGE DATA FROM D1 WORKER ===');
    console.log('Album ID:', albumId);
    console.log('Raw response:', JSON.stringify(data, null, 2));
    console.log('Response type:', typeof data);
    console.log('Album:', data.album);
    console.log('Players count:', data.players?.length || 0);
    console.log('=====================================');
    
    return data;
  } catch (error) {
    console.error('Error fetching album page from D1 worker:', error);
    throw error;
  }
}

/**
 * Fetch a single player by slug from D1
 * Since the worker doesn't support slug-based lookups, we fetch all players and match locally
 */
export async function fetchPlayerBySlug(slug: string): Promise<any | null> {
  try {
    // Fetch all players and match by slug locally
    const players = await fetchPlayers();
    
    // Import generatePlayerSlug for matching
    const { generatePlayerSlug } = await import('@/lib/utils');
    
    // Find the player that matches the slug
    const player = players.find((player: any) => {
      const playerSlug = generatePlayerSlug(player.name);
      return playerSlug === slug;
    });
    
    if (!player) {
      return null;
    }
    
    // If the worker has a detail endpoint, we could fetch additional data here
    // For now, return the player from the list
    return player;
  } catch (error) {
    console.error('Error fetching player from D1 worker:', error);
    throw error;
  }
}

