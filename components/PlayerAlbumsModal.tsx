'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { generatePlayerSlug, generateAlbumSlug } from '@/lib/utils';

interface AlbumEntry {
  album_id: number;
  title: string;
  role: string;
  song_name: string;
}

interface PlayerAlbumsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
}

export default function PlayerAlbumsModal({ isOpen, onClose, playerName }: PlayerAlbumsModalProps) {
  const [albums, setAlbums] = useState<AlbumEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && playerName) {
      fetchPlayerAlbums();
    }
  }, [isOpen, playerName]);

  const fetchPlayerAlbums = async () => {
    setIsLoading(true);
    try {
      const slug = generatePlayerSlug(playerName);
      const response = await fetch(`/api/players/${slug}`);
      if (response.ok) {
        const playerData = await response.json();
        setAlbums(playerData.albums || []);
      } else {
        console.error('Failed to fetch player albums');
        setAlbums([]);
      }
    } catch (error) {
      console.error('Error fetching player albums:', error);
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal Content */}
        <div
          className="bg-black border border-[#bc7d30]/30 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#bc7d30]/30">
            <h2 className="text-2xl md:text-3xl font-bold text-[#bc7d30]">
              {playerName}
            </h2>
            <button
              onClick={onClose}
              className="text-[#bc7d30] hover:text-[#bc7d30]/80 text-2xl font-bold transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {isLoading ? (
              <p className="text-left text-[#bc7d30]/60">Loading albums...</p>
            ) : albums.length > 0 ? (
              <div>
                <h3 className="text-xl font-bold text-[#bc7d30] mb-4">Albums</h3>
                <ul className="space-y-3">
                  {albums.map((album: AlbumEntry, index: number) => {
                    const albumSlug = generateAlbumSlug(album.title);
                    return (
                      <li
                        key={`${album.album_id}-${index}`}
                        className="border border-[#bc7d30]/30 rounded-lg p-4 hover:border-[#bc7d30]/60 transition-colors"
                      >
                        <Link
                          href={`/music/${albumSlug}`}
                          className="block"
                          onClick={onClose}
                        >
                        <h4 className="text-lg font-bold text-[#bc7d30] mb-2 hover:text-[#bc7d30]/80 transition-colors">
                          {album.title}
                        </h4>
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
            ) : (
              <p className="text-left text-[#bc7d30]/60">No albums found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

