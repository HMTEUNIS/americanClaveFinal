import { notFound } from 'next/navigation';
import AlbumArtCarousel from '@/components/AlbumArtCarousel';
import PlayerCard from '@/components/PlayerCard';
import Link from 'next/link';
import { getAllAlbumCoverUrls } from '@/lib/r2-images';
import { fetchAlbumPage, fetchAlbumById } from '@/lib/d1-worker';

interface Track {
  number: number;
  title: string;
  duration?: string;
}

interface Player {
  name: string;
  role?: string;
  picture?: string | null;
}

interface Album {
  id?: number;
  title: string;
  year?: number;
  artist?: string;
  by?: string;
  catno?: string; // Catalog number for R2 image URLs
  tracklist?: Track[];
  track_list?: any; // BLOB from DB, will be parsed
  buyLink?: string;
  players?: Player[]; // Players on this album
}

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  
  // Parse ID and validate
  const albumId = parseInt(id, 10);
  if (isNaN(albumId)) {
    notFound();
  }
  
  // Fetch album page data from the new endpoint
  let albumPageData: any = null;
  let album: any = null;
  let players: any[] = [];
  let tracklist: any[] = [];
  
  try {
    // Fetch from the new /album_page/:id endpoint
    albumPageData = await fetchAlbumPage(albumId);
    
    if (!albumPageData) {
      notFound();
    }
    
    // Extract album and players from the response
    const albumFromPage = albumPageData.album;
    const playersFromPage = albumPageData.players || [];
    
    // Fetch full album details (catno, year, by, etc.) using the album ID
    const fullAlbum = await fetchAlbumById(albumId);
    
    if (!fullAlbum) {
      notFound();
    }
    
    // Merge the album data: use full album details, but keep title from album_page if different
    album = {
      ...fullAlbum,
      id: albumFromPage.id,
      title: albumFromPage.title || fullAlbum.title,
    };
    
    console.log('=== ALBUM PAGE DATA PROCESSED ===');
    console.log('Album from page:', JSON.stringify(albumFromPage, null, 2));
    console.log('Full album:', JSON.stringify(fullAlbum, null, 2));
    console.log('Merged album:', JSON.stringify(album, null, 2));
    console.log('Players from page:', playersFromPage.length);
    console.log('================================');
    
    // Extract unique players (deduplicate by player id)
    const playersMap = new Map<number, Player>();
    playersFromPage.forEach((playerData: any) => {
      const playerId = playerData.id;
      if (playerId && !playersMap.has(playerId)) {
        // Parse pictures if it's a JSON string or array
        let picture: string | null = null;
        if (playerData.pictures) {
          try {
            if (typeof playerData.pictures === 'string') {
              const parsed = JSON.parse(playerData.pictures);
              if (Array.isArray(parsed) && parsed.length > 0) {
                picture = parsed[0]; // Use first picture
              } else if (typeof parsed === 'string') {
                picture = parsed;
              }
            } else if (Array.isArray(playerData.pictures) && playerData.pictures.length > 0) {
              picture = playerData.pictures[0]; // Use first picture
            } else if (typeof playerData.pictures === 'string') {
              picture = playerData.pictures;
            }
          } catch (e) {
            console.error('Error parsing player pictures:', e);
          }
        }
        
        // For players with multiple roles, we'll use the first role found
        // You might want to aggregate roles later if needed
        playersMap.set(playerId, {
          name: playerData.name,
          role: playerData.role || undefined,
          picture: picture || null,
        });
      }
    });
    players = Array.from(playersMap.values());
    
    // Extract unique song names from the players array (each player has a song_name)
    const uniqueSongNames = new Set<string>();
    playersFromPage.forEach((playerData: any) => {
      if (playerData.song_name) {
        uniqueSongNames.add(playerData.song_name);
      }
    });
    
    // Convert to tracklist array
    const songNamesArray = Array.from(uniqueSongNames);
    tracklist = songNamesArray.map((songName, index) => ({
      id: index + 1,
      title: songName,
      number: index + 1,
    }));
    
    console.log('=== PROCESSED DATA ===');
    console.log('Unique players:', players.length);
    console.log('Players:', JSON.stringify(players, null, 2));
    console.log('Unique songs:', uniqueSongNames.size);
    console.log('Tracklist:', JSON.stringify(tracklist, null, 2));
    console.log('=====================');
    
  } catch (error) {
    console.error('Error fetching album page:', error);
    notFound();
  }

  // Generate R2 image URLs from catno
  const albumArtUrls = album.catno ? getAllAlbumCoverUrls(album.catno) : [];
  console.log('Generated R2 URLs:', albumArtUrls);

  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Album Header */}
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {album.title}
            </h1>
            {(album.artist || album.by) && (
              <p className="text-2xl text-[#bc7d30]/80 mb-2">{album.artist || album.by}</p>
            )}
            {album.year && (
              <p className="text-lg text-[#bc7d30]/60">{album.year}</p>
            )}
          </div>

          {/* Album Art Carousel */}
          {albumArtUrls.length > 0 && (
            <div className="mb-12">
              <AlbumArtCarousel images={albumArtUrls} albumTitle={album.title} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Tracklist */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Tracklist</h2>
              {tracklist.length > 0 ? (
                <ul className="space-y-3">
                  {tracklist.map((track: any, index: number) => {
                    // Handle different track formats from DB
                    const trackNumber = track.number || track.position || index + 1;
                    const trackTitle = track.title || track.name || 'Unknown Track';
                    const trackDuration = track.duration;
                    
                    return (
                      <li 
                        key={track.id || index}
                        className="flex items-center justify-between border-l-4 border-[#bc7d30]/30 pl-4 py-2"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-[#bc7d30]/60 font-mono text-sm w-8">
                            {String(trackNumber).padStart(2, '0')}
                          </span>
                          <span className="text-xl text-[#bc7d30]/90">{trackTitle}</span>
                        </div>
                        {trackDuration && (
                          <span className="text-[#bc7d30]/60 text-sm">{trackDuration}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-[#bc7d30]/60">No tracklist available.</p>
              )}

              {/* Buy Link */}
              {album.buyLink && (
                <div className="mt-8">
                  <Link
                    href={album.buyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-[#bc7d30] text-black font-bold rounded-lg hover:bg-[#bc7d30]/80 transition-colors"
                  >
                    Purchase Album
                  </Link>
                </div>
              )}
            </div>

            {/* Players Section */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Players</h2>
              {/* Debug info */}
              <div className="mb-4 text-xs text-[#bc7d30]/40">
                Debug: players.length = {players?.length || 0}, isArray = {Array.isArray(players) ? 'true' : 'false'}
              </div>
              {players && Array.isArray(players) && players.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {players.map((player: Player, index: number) => {
                    console.log(`Rendering player ${index}:`, player);
                    return (
                      <PlayerCard
                        key={`${player.name}-${index}`}
                        name={player.name}
                        role={player.role}
                        picture={player.picture}
                      />
                    );
                  })}
                </div>
              ) : (
                <div>
                  <p className="text-[#bc7d30]/60">No players listed for this album.</p>
                  <p className="text-xs text-[#bc7d30]/40 mt-2">
                    Debug: players = {JSON.stringify(players)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

