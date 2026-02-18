import { notFound } from 'next/navigation';
import AlbumArtCarousel from '@/components/AlbumArtCarousel';
import PlayerCard from '@/components/PlayerCard';
import Link from 'next/link';
import { getAllAlbumCoverUrls } from '@/lib/r2-images';
import { fetchAlbumPage, fetchAlbumById, fetchAlbums, fetchPlayersByAlbumId } from '@/lib/d1-worker';
import { generatePlayerSlug, generateAlbumSlug } from '@/lib/utils';

interface Track {
  number: number;
  title: string;
  duration?: string;
}

interface Player {
  id?: number;
  name: string;
  role?: string;
  picture?: string | null;
}

interface PlayerFromJunction {
  id: number;
  name: string;
}

interface Album {
  id?: number;
  title: string;
  year?: number;
  artist?: string;
  by?: string;
  catno?: string; // Catalog number for R2 image URLs
  dates?: string; // Recording and release dates
  tracklist?: Track[];
  track_list?: any; // BLOB from DB, will be parsed
  buyLink?: string;
  players?: Player[]; // Players on this album
}

interface AlbumDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { slug } = await params;
  
  // Decode the slug in case it's URL encoded
  const decodedSlug = decodeURIComponent(slug);
  
  console.log('=== ALBUM PAGE BY SLUG ===');
  console.log('Raw slug:', slug);
  console.log('Decoded slug:', decodedSlug);
  
  // Fetch album by slug - do server-side matching
  let albumPageData: any = null;
  let album: any = null;
  let players: any[] = [];
  let playersFromJunction: PlayerFromJunction[] = [];
  let tracklist: any[] = [];
  
  try {
    // If slug is numeric, treat as ID (backwards compatibility)
    const numericId = parseInt(decodedSlug, 10);
    let albumId: number | null = null;
    let fullAlbum: any = null;
    
    if (!isNaN(numericId)) {
      // Fetch by ID directly
      fullAlbum = await fetchAlbumById(numericId);
      if (fullAlbum) {
        albumId = numericId;
      }
    } else {
      // Fetch all albums and match by slug
      const albums = await fetchAlbums();
      console.log('Total albums fetched:', albums.length);
      
      // Try exact match
      let matchedAlbum = albums.find(a => {
        const albumSlug = generateAlbumSlug(a.title);
        console.log(`Comparing: "${albumSlug}" === "${decodedSlug}"`);
        return albumSlug === decodedSlug;
      });
      
      // Try case-insensitive match
      if (!matchedAlbum) {
        const lowerSlug = decodedSlug.toLowerCase();
        matchedAlbum = albums.find(a => {
          const albumSlug = generateAlbumSlug(a.title).toLowerCase();
          return albumSlug === lowerSlug;
        });
      }
      
      // Try partial match (without hyphens)
      if (!matchedAlbum) {
        const lowerSlug = decodedSlug.toLowerCase().replace(/-/g, '');
        matchedAlbum = albums.find(a => {
          const albumSlug = generateAlbumSlug(a.title).toLowerCase().replace(/-/g, '');
          return albumSlug === lowerSlug;
        });
      }
      
      if (!matchedAlbum) {
        console.error('Album not found for slug:', decodedSlug);
        console.log('Sample slugs:', albums.slice(0, 5).map(a => ({
          title: a.title,
          slug: generateAlbumSlug(a.title)
        })));
        notFound();
      }
      
      // Ensure matched album has an ID
      if (!matchedAlbum.id) {
        console.error('Matched album has no ID');
        notFound();
      }
      
      console.log('Found album:', matchedAlbum.title, 'ID:', matchedAlbum.id);
      // TypeScript now knows matchedAlbum.id is not null/undefined
      const foundAlbumId: number = matchedAlbum.id;
      albumId = foundAlbumId;
      fullAlbum = await fetchAlbumById(foundAlbumId);
    }
    
    if (!fullAlbum || !albumId) {
      console.error('Album not found for slug:', decodedSlug);
      notFound();
    }
    
    console.log('Full album fetched:', fullAlbum.title, 'ID:', albumId);
    
    // Fetch from the new /album_page/:id endpoint
    albumPageData = await fetchAlbumPage(albumId);
    
    if (!albumPageData) {
      notFound();
    }
    
    // Extract album and players from the response
    const albumFromPage = albumPageData.album;
    const playersFromPage = albumPageData.players || [];
    
    if (!fullAlbum) {
      notFound();
    }
    
    // Debug: Log all fields from fullAlbum before merging
    console.log('=== FULL ALBUM FIELDS ===');
    console.log('Full album keys:', Object.keys(fullAlbum || {}));
    console.log('Full album tracklist:', fullAlbum?.tracklist);
    console.log('Full album track_list:', fullAlbum?.track_list);
    console.log('Full album tracklist type:', typeof fullAlbum?.tracklist);
    console.log('Full album track_list type:', typeof fullAlbum?.track_list);
    if (fullAlbum?.tracklist) {
      console.log('tracklist isArray:', Array.isArray(fullAlbum.tracklist));
      if (Array.isArray(fullAlbum.tracklist) && fullAlbum.tracklist.length > 0) {
        console.log('First tracklist item:', fullAlbum.tracklist[0], 'type:', typeof fullAlbum.tracklist[0]);
      }
    }
    if (fullAlbum?.track_list) {
      console.log('track_list isArray:', Array.isArray(fullAlbum.track_list));
      if (Array.isArray(fullAlbum.track_list) && fullAlbum.track_list.length > 0) {
        console.log('First track_list item:', fullAlbum.track_list[0], 'type:', typeof fullAlbum.track_list[0]);
      }
    }
    console.log('========================');
    
    // Merge the album data: use full album details, but keep title from album_page if different
    // IMPORTANT: Preserve tracklist/track_list from fullAlbum
    album = {
      ...fullAlbum,
      id: albumFromPage.id,
      title: albumFromPage.title || fullAlbum.title,
      // Explicitly preserve tracklist fields
      tracklist: fullAlbum.tracklist,
      track_list: fullAlbum.track_list,
    };
    
    // Parse tracklist from album object
    // The tracklist should be on the album object as 'tracklist' or 'track_list'
    // It's an array of strings like ["Track 1", "Track 2", ...]
    // NOTE: The tracklist might be a JSON string that needs parsing
    console.log('=== PARSING TRACKLIST ===');
    console.log('album.tracklist:', album.tracklist);
    console.log('album.tracklist type:', typeof album.tracklist);
    console.log('album.tracklist isArray:', Array.isArray(album.tracklist));
    console.log('album.track_list:', album.track_list);
    
    // First, try to parse tracklist if it's a string
    let parsedTracklist: any = null;
    if (album.tracklist) {
      if (typeof album.tracklist === 'string') {
        // It's a JSON string - parse it
        try {
          parsedTracklist = JSON.parse(album.tracklist);
          console.log('Parsed tracklist from string:', parsedTracklist);
        } catch (e) {
          console.error('Error parsing tracklist string:', e);
          parsedTracklist = null;
        }
      } else if (Array.isArray(album.tracklist)) {
        // Already an array
        parsedTracklist = album.tracklist;
      }
    }
    
    // Now process the parsed tracklist
    if (parsedTracklist && Array.isArray(parsedTracklist)) {
      if (parsedTracklist.length > 0 && typeof parsedTracklist[0] === 'string') {
        // Array of strings - convert to track objects
        tracklist = parsedTracklist.map((title: string, index: number) => ({
          id: index + 1,
          number: index + 1,
          title: title,
        }));
        console.log('Converted string array to tracklist:', tracklist);
      } else {
        // Array of objects
        tracklist = parsedTracklist;
        console.log('Using tracklist as objects:', tracklist);
      }
    } else if (album.track_list) {
      // Parse if it's a JSON string
      try {
        if (typeof album.track_list === 'string') {
          const parsed = JSON.parse(album.track_list);
          if (Array.isArray(parsed)) {
            if (parsed.length > 0 && typeof parsed[0] === 'string') {
              // Array of strings - convert to track objects
              tracklist = parsed.map((title: string, index: number) => ({
                id: index + 1,
                number: index + 1,
                title: title,
              }));
            } else {
              // Array of objects
              tracklist = parsed;
            }
          } else {
            tracklist = [];
          }
        } else if (Array.isArray(album.track_list)) {
          if (album.track_list.length > 0 && typeof album.track_list[0] === 'string') {
            // Array of strings - convert to track objects
            tracklist = album.track_list.map((title: string, index: number) => ({
              id: index + 1,
              number: index + 1,
              title: title,
            }));
          } else {
            tracklist = album.track_list;
          }
        }
      } catch (e) {
        console.error('Error parsing tracklist:', e);
        tracklist = [];
      }
    }
    
    // Final check - if tracklist is still empty, log what we have
    if (tracklist.length === 0) {
      console.warn('=== TRACKLIST IS EMPTY ===');
      console.warn('album object keys:', Object.keys(album));
      console.warn('album.tracklist:', album.tracklist);
      console.warn('album.track_list:', album.track_list);
      console.warn('fullAlbum.tracklist:', fullAlbum?.tracklist);
      console.warn('fullAlbum.track_list:', fullAlbum?.track_list);
      // Try to find any field that might be tracklist
      const possibleFields = Object.keys(album).filter(k => 
        k.toLowerCase().includes('track') || k.toLowerCase().includes('song')
      );
      console.warn('Possible tracklist fields:', possibleFields);
      if (possibleFields.length > 0) {
        possibleFields.forEach(field => {
          console.warn(`  ${field}:`, album[field]);
        });
      }
      console.warn('==========================');
    }
    
    // Fetch players from album_players junction table
    try {
      playersFromJunction = await fetchPlayersByAlbumId(albumId);
      // Sort by name
      playersFromJunction.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error fetching players from junction table:', error);
      // Continue with empty array if fetch fails
    }
    
    console.log('=== ALBUM PAGE DATA PROCESSED ===');
    console.log('Album from page:', JSON.stringify(albumFromPage, null, 2));
    console.log('Full album:', JSON.stringify(fullAlbum, null, 2));
    console.log('Merged album:', JSON.stringify(album, null, 2));
    console.log('Tracklist from album:', album.tracklist);
    console.log('Track_list from album:', album.track_list);
    console.log('Parsed tracklist:', JSON.stringify(tracklist, null, 2));
    console.log('Players from page:', playersFromPage.length);
    console.log('Players from junction:', playersFromJunction.length);
    console.log('================================');
    
    // Extract unique players (deduplicate by player id) - legacy from player_songs
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
          id: playerId,
          name: playerData.name,
          role: playerData.role || undefined,
          picture: picture || null,
        });
      }
    });
    players = Array.from(playersMap.values());
    
    console.log('=== PROCESSED DATA ===');
    console.log('Unique players (legacy):', players.length);
    console.log('Players (legacy):', JSON.stringify(players, null, 2));
    console.log('Players from junction:', JSON.stringify(playersFromJunction, null, 2));
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
          <div className="mb-12 text-left">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {album.title}
            </h1>
            {(album.artist || album.by) && (
              <p className="text-2xl text-[#bc7d30]/80 mb-2">{album.artist || album.by}</p>
            )}
            {album.catno && (
              <p className="text-lg text-[#bc7d30]/70 mb-2 font-mono">{album.catno}</p>
            )}
            {album.dates && (
              <p className="text-lg text-[#bc7d30]/60 mb-2 italic">{album.dates}</p>
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
              {/* Players from album_players junction table (primary) */}
              {playersFromJunction.length > 0 ? (
                <div className="space-y-3">
                  {playersFromJunction.map((player: PlayerFromJunction) => {
                    const playerSlug = generatePlayerSlug(player.name);
                    return (
                      <Link
                        key={`player-${player.id}`}
                        href={`/players/${playerSlug}`}
                        className="block"
                      >
                        <div className="border border-[#bc7d30]/30 rounded-lg p-4 hover:border-[#bc7d30]/60 transition-colors bg-black">
                          <h3 className="text-xl font-bold text-[#bc7d30] hover:text-[#bc7d30]/80 transition-colors">
                            {player.name}
                          </h3>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : players && Array.isArray(players) && players.length > 0 ? (
                // Fallback to legacy players from player_songs
                <div className="grid grid-cols-1 gap-4">
                  {players.map((player: Player, index: number) => (
                    <PlayerCard
                      key={`legacy-player-${player.id || index}`}
                      name={player.name}
                      role={player.role}
                      picture={player.picture}
                    />
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-[#bc7d30]/60">No players listed for this album.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

