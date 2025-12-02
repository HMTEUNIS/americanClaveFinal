'use client';

import { useState, useMemo, useEffect } from 'react';
import PlayerCard from '@/components/PlayerCard';

interface Player {
  name: string;
  role?: string;
  albums?: string[];
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

  // Filter and sort players
  const sortedPlayers = useMemo(() => {
    // First filter players based on search query
    const filtered = players.filter(player => {
      const name = player.name.toLowerCase();
      const query = searchQuery.toLowerCase();
      return name.includes(query);
    });

    // Separate core players and other players
    const corePlayers: Player[] = [];
    const otherPlayers: Player[] = [];

    filtered.forEach(player => {
      if (isCorePlayer(player)) {
        corePlayers.push(player);
      } else {
        otherPlayers.push(player);
      }
    });

    // Sort core players by their priority order
    corePlayers.sort((a, b) => {
      const indexA = getCorePlayerIndex(a);
      const indexB = getCorePlayerIndex(b);
      return indexA - indexB;
    });

    // Sort other players alphabetically by name
    otherPlayers.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    // Combine: core players first, then other players
    return [...corePlayers, ...otherPlayers];
  }, [searchQuery, players]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30]">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">Players</h1>
          <p className="text-center text-[#bc7d30]/60">Loading players...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Players</h1>
        <span>to do: <ul><li>add photos for players</li>
<li>add player details and find available picture for each player</li>          


          </ul>
        </span>
        {/* Search Bar */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] placeholder-[#bc7d30]/50 focus:outline-none focus:border-[#bc7d30]/60 transition-colors"
          />
        </div>

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlayers.map((player, index) => (
            <PlayerCard
              key={`${player.name}-${index}`}
              name={player.name}
              role={player.role}
              albums={player.albums}
            />
          ))}
        </div>

        {sortedPlayers.length === 0 && (
          <p className="text-center text-[#bc7d30]/60 mt-12">
            {searchQuery ? `No players found matching "${searchQuery}"` : 'No players found'}
          </p>
        )}
      </div>
    </main>
  );
}
