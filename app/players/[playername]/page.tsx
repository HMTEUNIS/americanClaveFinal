import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generatePlayerSlug, getPlayerImagePath, generateAlbumSlug } from '@/lib/utils';
import Image from 'next/image';
import { fetchPlayerBySlug, fetchAlbumsByPlayerId } from '@/lib/d1-worker';

interface AlbumEntry {
  album_id: number;
  title: string;
  role: string;
  song_name: string;
}

interface AlbumFromJunction {
  id: number;
  title: string;
  artist?: string;
  by?: string;
  catno?: string;
  year_released?: number;
  year_recorded?: number;
}

interface Player {
  id?: number;
  name: string;
  role?: string;
  albums?: AlbumEntry[]; // Nested albums from backend (legacy)
  images?: string[];
  pictures?: string; // BLOB from DB, will be parsed
  birthdate?: string;
  deathdate?: string;
  bio?: string;
}

interface PlayerProfilePageProps {
  params: Promise<{ playername: string }>;
}

// Core players list - only these players have full detail pages
const corePlayerOrder: string[] = [
  'Alfredo Triff',
  'Andy Gonzalez',
  'Astor Piazzolla',
  'Charles Neville',
  'Don Pullen',
  'Fernando Saunders',
  'Horacio "El Negro" Hernandez',
  'Ishmael Reed',
  'Jack Bruce',
  'Milton Cardona',
  '"Puntilla" Orlando Rios',
  'Robby Ameen',
  'Silvana DeLuigi',
];

// Helper function to check if a player is a core player
function isCorePlayer(playerName: string): boolean {
  return corePlayerOrder.some(
    core => core.toLowerCase() === playerName.toLowerCase()
  );
}

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { playername } = await params;
  
  // Fetch player from D1 worker
  let fullPlayerData;
  try {
    fullPlayerData = await fetchPlayerBySlug(playername);
    
    if (!fullPlayerData) {
      notFound();
    }
    
    // Allow all players to have profile pages (removed core player restriction)
    // Core players still get priority in listings, but all players are accessible
  } catch (error) {
    console.error('Error fetching player:', error);
    notFound();
  }
  
  // Check if this is a core player (for conditional rendering)
  const isCore = isCorePlayer(fullPlayerData.name);
  
  // Parse pictures BLOB if it's a string (JSON array) - only for core players
  let images: string[] = [];
  if (isCore && fullPlayerData.pictures) {
    try {
      if (typeof fullPlayerData.pictures === 'string') {
        images = JSON.parse(fullPlayerData.pictures);
      } else if (Array.isArray(fullPlayerData.pictures)) {
        images = fullPlayerData.pictures;
      }
    } catch (e) {
      console.error('Error parsing player pictures:', e);
    }
  }
  
  // Get player image from /playerpics/, fallback to database images, then placeholder - only for core players
  const playerImagePath = isCore ? getPlayerImagePath(fullPlayerData.name) : null;
  const profilePicture = playerImagePath || (images && images.length > 0 ? images[0] : null) || '/profileplaceholder.jpg';
  
  // Get birthdate and deathdate - only for core players
  const birthdate = isCore ? (fullPlayerData.birthdate || null) : null;
  const deathdate = isCore ? (fullPlayerData.deathdate || null) : null;
  
  // Format date range
  const formatDateRange = () => {
    if (birthdate && deathdate) {
      return `${birthdate} - ${deathdate}`;
    } else if (birthdate) {
      return `Born ${birthdate}`;
    } else if (deathdate) {
      return `Died ${deathdate}`;
    }
    return null;
  };
  
  const dateRange = formatDateRange();
  
  // Bio text - only for core players
  const bioText = isCore ? (fullPlayerData.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.') : null;
  
  // Fetch albums from album_players junction table
  // The worker's /players/:id endpoint already includes albums in the response
  // The worker returns: { ...player, albums: [album objects from albums table] }
  let albumsFromJunction: AlbumFromJunction[] = [];
  if (fullPlayerData.albums && Array.isArray(fullPlayerData.albums) && fullPlayerData.albums.length > 0) {
    // Albums are already included in the player response from the worker
    // These are full album objects with id, title, artist, catno, year_released, etc.
    albumsFromJunction = fullPlayerData.albums as AlbumFromJunction[];
    // Sort by year_released (ascending, nulls last)
    albumsFromJunction.sort((a, b) => {
      if (!a.year_released && !b.year_released) return 0;
      if (!a.year_released) return 1;
      if (!b.year_released) return -1;
      return a.year_released - b.year_released;
    });
  } else if (fullPlayerData.id) {
    // Fallback: fetch albums separately if not included in response
    try {
      albumsFromJunction = await fetchAlbumsByPlayerId(fullPlayerData.id);
      // Sort by year_released (ascending, nulls last)
      albumsFromJunction.sort((a, b) => {
        if (!a.year_released && !b.year_released) return 0;
        if (!a.year_released) return 1;
        if (!b.year_released) return -1;
        return a.year_released - b.year_released;
      });
    } catch (error) {
      console.error('Error fetching albums for player:', error);
      // Continue with empty array if fetch fails
    }
  }
  
  // Legacy albums from nested attribute (for old player_songs format)
  // Only use if albumsFromJunction is empty
  const legacyAlbums: AlbumEntry[] = 
    (albumsFromJunction.length === 0 && fullPlayerData.albums && Array.isArray(fullPlayerData.albums))
      ? fullPlayerData.albums.filter((a: any) => a.album_id !== undefined && !a.id) as AlbumEntry[]
      : [];
  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Player Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {fullPlayerData.name}
            </h1>
            {isCore && dateRange && (
              <p className="text-lg text-[#bc7d30]/60 mb-2">{dateRange}</p>
            )}
            {isCore && fullPlayerData.role && (
              <p className="text-2xl text-[#bc7d30]/80">{fullPlayerData.role}</p>
            )}
          </div>

          {/* Bio Section - Only for core players */}
          {isCore && bioText && (
            <div className="mb-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Bio Text - Left */}
                <div className="flex-1">
                  <p className="text-lg text-[#bc7d30]/90 leading-relaxed">
                    {bioText}
                  </p>
                </div>
                
                {/* Profile Picture - Right */}
                <div className="relative w-full md:w-64 h-64 flex-shrink-0 rounded-lg overflow-hidden border border-[#bc7d30]/30">
                  <Image
                    src={profilePicture}
                    alt={fullPlayerData.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 256px"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          )}

          {/* Player Images - Only for core players */}
          {isCore && images && images.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Photos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#bc7d30]/30 bg-black/50">
                    <Image
                      src={image}
                      alt={`${fullPlayerData.name} - Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      onError={(e) => {
                        // Hide broken images
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Albums Section */}
          {(albumsFromJunction.length > 0 || legacyAlbums.length > 0) && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Albums</h2>
              <ul className="space-y-4">
                {/* Albums from album_players junction table */}
                {albumsFromJunction.map((album: AlbumFromJunction) => {
                  const artist = album.artist || album.by;
                  const albumSlug = generateAlbumSlug(album.title);
                  return (
                    <li 
                      key={`album-${album.id}`}
                      className="border border-[#bc7d30]/30 rounded-lg p-4 hover:border-[#bc7d30]/60 transition-colors bg-black"
                    >
                      <Link
                        href={`/music/${albumSlug}`}
                        className="block"
                      >
                        <h3 className="text-xl font-bold text-[#bc7d30] mb-2 hover:text-[#bc7d30]/80 transition-colors">
                          {album.title}
                        </h3>
                        <div className="text-sm text-[#bc7d30]/70 space-y-1">
                          {artist && artist !== fullPlayerData.name && (
                            <p className="text-[#bc7d30]/80">Artist: {artist}</p>
                          )}
                          {album.catno && (
                            <p className="font-mono">Catalog: {album.catno}</p>
                          )}
                          {album.year_released && (
                            <p>Released: {album.year_released}</p>
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
                {/* Legacy albums (fallback) */}
                {albumsFromJunction.length === 0 && legacyAlbums.map((album: AlbumEntry, index: number) => {
                  const albumSlug = generateAlbumSlug(album.title);
                  return (
                    <li 
                      key={`legacy-${album.album_id}-${index}`}
                      className="border border-[#bc7d30]/30 rounded-lg p-4 hover:border-[#bc7d30]/60 transition-colors bg-black"
                    >
                      <Link
                        href={`/music/${albumSlug}`}
                        className="block"
                      >
                      <h3 className="text-xl font-bold text-[#bc7d30] mb-2 hover:text-[#bc7d30]/80 transition-colors">
                        {album.title}
                      </h3>
                      <div className="text-sm text-[#bc7d30]/70 space-y-1">
                        {album.role && (
                          <p>Role: {album.role}</p>
                        )}
                        {album.song_name && (
                          <p>Song: {album.song_name}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

