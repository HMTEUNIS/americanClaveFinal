'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AlbumCard from '@/components/AlbumCard';

interface Album {
  id: number;
  title: string;
  year?: number;
  artist?: string;
  by?: string; // Artist field from DB
  catno?: string; // Catalog number for R2 image URLs
  dates?: string; // Recording and release dates
}

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch albums from API
  useEffect(() => {
    async function fetchAlbums() {
      try {
        const response = await fetch('/api/albums');
        if (response.ok) {
          const data = await response.json();
          console.log('Albums fetched:', data);
          setAlbums(data);
        } else {
          console.error('Failed to fetch albums');
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  // Filter albums based on search query (title or artist)
  const filteredAlbums = albums.filter(album => {
    const artist = album.artist || album.by || '';
    const searchableText = `${album.title} ${artist}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return searchableText.includes(query);
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30] relative overflow-hidden">
        {/* Background Image - Bottom Right */}
        <div className="fixed bottom-[5px] right-[5px] w-[75vw] h-[75vh] z-0 pointer-events-none">
          <Image
            src="/musicpagebackground.jpg"
            alt="Music page background"
            fill
            className="object-contain object-right-bottom"
            sizes="75vw"
            unoptimized
            priority={false}
          />
        </div>
        <div className="container mx-auto px-4 py-16 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">Music</h1>
          <p className="text-center text-[#bc7d30]/60">Loading albums...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#bc7d30] relative overflow-hidden">
      {/* Background Image - Bottom Right */}
      <div className="fixed bottom-[5px] right-[5px] w-[75vw] h-[75vh] z-0 pointer-events-none">
        <Image
          src="/musicpagebackground.jpg"
          alt="Music page background"
          fill
          className="object-contain object-right-bottom"
          sizes="75vw"
          unoptimized
          priority={false}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Music</h1>
        <span>to do: <ul><li>get cover images for each album</li>
        <li>get release years</li>
        </ul></span>
        {/* Search Bar */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Search albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 px-4 py-3 bg-black border border-[#bc7d30]/30 rounded-lg text-[#bc7d30] placeholder-[#bc7d30]/50 focus:outline-none focus:border-[#bc7d30]/60 transition-colors"
          />
        </div>

        {/* Album Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              title={album.title}
              year={album.year}
              artist={album.artist || album.by}
              catno={album.catno}
              dates={album.dates}
            />
          ))}
        </div>

        {filteredAlbums.length === 0 && (
          <p className="text-center text-[#bc7d30]/60 mt-12">
            {searchQuery ? `No albums found matching "${searchQuery}"` : 'No albums found'}
          </p>
        )}
      </div>

      {/* Floating Quote Box */}
      <div className="fixed bottom-6 right-6 max-w-sm bg-black/90 border border-[#bc7d30]/30 rounded-lg p-4 md:p-6 shadow-lg z-10">
        <p className="text-[#bc7d30] text-sm md:text-base leading-relaxed mb-4 italic">
          "Kip Hanrahan's worldly and highly artistic approach provides a road map for ongoing success. Most importantly, Hanrahan paints vivid portraits of life, love and reality without becoming self-absorbed or overbearing. Overall, his productions are generally accessible and entertaining while maintaining that perpetual touch of class."
        </p>
        <div className="text-right">
          <p className="text-[#bc7d30] font-semibold text-sm md:text-base">Glenn Astarita</p>
          <p className="text-[#bc7d30]/70 text-xs md:text-sm">AllAboutJazz.com</p>
        </div>
      </div>
    </main>
  );
}
