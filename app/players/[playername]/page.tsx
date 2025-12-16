import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generatePlayerSlug, getPlayerImagePath } from '@/lib/utils';
import Image from 'next/image';
import { fetchPlayerBySlug } from '@/lib/d1-worker';

interface AlbumEntry {
  album_id: number;
  title: string;
  role: string;
  song_name: string;
}

interface Player {
  name: string;
  role?: string;
  albums?: AlbumEntry[]; // Nested albums from backend
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
    
    // Only allow access to core/primary players
    if (!isCorePlayer(fullPlayerData.name)) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching player:', error);
    notFound();
  }
  
  // Parse pictures BLOB if it's a string (JSON array)
  let images: string[] = [];
  if (fullPlayerData.pictures) {
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
  
  // Get player image from /playerpics/, fallback to database images, then placeholder
  const playerImagePath = getPlayerImagePath(fullPlayerData.name);
  const profilePicture = playerImagePath || (images && images.length > 0 ? images[0] : null) || '/profileplaceholder.jpg';
  
  // Get birthdate and deathdate
  const birthdate = fullPlayerData.birthdate || null;
  const deathdate = fullPlayerData.deathdate || null;
  
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
  
  // Bio text - use actual bio if available, otherwise lorem ipsum placeholder
  const bioText = fullPlayerData.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
  
  // Albums from the nested albums attribute
  const albums: AlbumEntry[] = fullPlayerData.albums || [];

  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Player Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {fullPlayerData.name}
            </h1>
            {dateRange && (
              <p className="text-lg text-[#bc7d30]/60 mb-2">{dateRange}</p>
            )}
            {fullPlayerData.role && (
              <p className="text-2xl text-[#bc7d30]/80">{fullPlayerData.role}</p>
            )}
          </div>

          {/* Bio Section */}
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

          {/* Player Images */}
          {images && images.length > 0 && (
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
          {albums && albums.length > 0 && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Albums</h2>
              <ul className="space-y-4">
                {albums.map((album: AlbumEntry, index: number) => (
                  <li 
                    key={`${album.album_id}-${index}`}
                    className="border border-[#bc7d30]/30 rounded-lg p-4 hover:border-[#bc7d30]/60 transition-colors bg-black"
                  >
                    <Link
                      href={`/music/${album.album_id}`}
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
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

