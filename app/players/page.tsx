'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import PlayerCard from '@/components/PlayerCard';
import SimplePlayerCard from '@/components/SimplePlayerCard';

interface Player {
  name: string;
  role?: string;
  albums?: string[];
  picture?: string | null;
}

// Core players in priority order (these will be displayed first)
// Note: Matching is case-insensitive
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
function isCorePlayer(player: Player): boolean {
  return corePlayerOrder.some(
    core => core.toLowerCase() === player.name.toLowerCase()
  );
}

// Helper function to get core player priority index
function getCorePlayerIndex(player: Player): number {
  const index = corePlayerOrder.findIndex(
    core => core.toLowerCase() === player.name.toLowerCase()
  );
  return index === -1 ? Infinity : index;
}

export default function PlayersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch players from API
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch('/api/players');
        if (response.ok) {
          const data = await response.json();
          setPlayers(data);
        } else {
          console.error('Failed to fetch players');
        }
      } catch (error) {
        console.error('Error fetching players:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlayers();
  }, []);

  // Separate and filter players
  const { corePlayers, otherPlayers } = useMemo(() => {
    // First filter players based on search query
    const filtered = players.filter(player => {
      const name = player.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    });

    // Separate core players and other players
    const core: Player[] = [];
    const other: Player[] = [];

    filtered.forEach(player => {
      if (isCorePlayer(player)) {
        core.push(player);
      } else {
        other.push(player);
      }
    });

    // Sort core players by their priority order
    core.sort((a, b) => {
      const indexA = getCorePlayerIndex(a);
      const indexB = getCorePlayerIndex(b);
      return indexA - indexB;
    });

    // Sort other players alphabetically by name
    other.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    return { corePlayers: core, otherPlayers: other };
  }, [searchQuery, players]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30]">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">Players</h1>
          <p className="text-left text-[#bc7d30]/60">Loading players...</p>
        </div>
      </main>
    );
  }

  // Player background images
  const playerImages = [
    '/players-Alfredo_Triff_2.jpg',
    '/players-Andy.jpg',
    '/players-ASTORHAN.jpg',
    '/players-bang1.jpg',
    '/players-Charles.jpg',
    '/players-DD.jpg',
    '/players-dmurray.jpg',
    '/players-FER-KIP7-3.jpg',
    '/players-Jack-2.jpg',
    '/players-Milton.jpg',
    '/players-Negro-2.jpg',
    '/players-pullen-2-25-95.jpg',
  ];

  return (
    <main className="min-h-screen bg-black text-[#bc7d30] relative overflow-hidden">
      {/* Background Images - Grid of all images spread across the page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-4 gap-4 md:gap-6 p-4 md:p-8">
          {playerImages.map((img, idx) => (
            <div key={idx} className="relative aspect-square opacity-20">
              <Image
                src={img}
                alt=""
                fill
                className="object-cover sepia"
                sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 25vw"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 pb-32 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Players</h1>
        
        {/* Core Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {corePlayers.map((player, index) => (
            <PlayerCard
              key={`${player.name}-${index}`}
              name={player.name}
              role={player.role}
              albums={player.albums}
              picture={player.picture}
            />
          ))}
        </div>

        {/* Button to open drawer */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="bg-black border border-[#bc7d30]/30 text-[#bc7d30] font-bold py-3 px-8 rounded-full hover:border-[#bc7d30]/60 transition-colors"
          >
            Also Featuring
          </button>
        </div>

        {/* Bottom Drawer */}
        <div
          className={`fixed bottom-0 left-0 right-0 bg-black border-t border-[#bc7d30]/30 z-50 transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
          style={{ maxHeight: '80vh' }}
        >
          {/* Drawer Header with Close Button */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#bc7d30]/30">
            <h2 className="text-2xl font-bold text-[#bc7d30]">All Players</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 bg-[#bc7d30] text-black font-bold rounded hover:bg-[#bc7d30]/80 transition-colors"
            >
              Close
            </button>
          </div>
          
          <div className="container mx-auto px-4 py-6 max-h-[calc(80vh-80px)] overflow-y-auto">
            {/* Search Bar in Drawer */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] placeholder-[#bc7d30]/50 focus:outline-none focus:border-[#bc7d30]/60 transition-colors"
              />
            </div>

            {/* Other Players Grid */}
            {otherPlayers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {otherPlayers.map((player, index) => (
                  <SimplePlayerCard
                    key={`${player.name}-${index}`}
                    name={player.name}
                    role={player.role}
                  />
                ))}
              </div>
            ) : (
              <p className="text-left text-[#bc7d30]/60 mt-12">
                {searchQuery ? `No players found matching "${searchQuery}"` : 'No players found'}
              </p>
            )}
          </div>
        </div>

        {/* Backdrop overlay when drawer is open */}
        {isDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
