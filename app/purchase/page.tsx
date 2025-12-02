'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AlbumCard from '@/components/AlbumCard';

interface PurchasableAlbum {
  id: number;
  title: string;
  year?: number;
  artist?: string;
  by?: string;
  price?: number; // Price in dollars
  availableForPurchase?: boolean;
  cloudflareWavUrl?: string; // URL to WAV file on Cloudflare
  catno?: string;
}

export default function PurchasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [albums, setAlbums] = useState<PurchasableAlbum[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(true);

  // Fetch purchasable albums from API
  useEffect(() => {
    async function fetchAlbums() {
      try {
        const response = await fetch('/api/albums?purchasable=true');
        if (response.ok) {
          const data = await response.json();
          setAlbums(data);
        } else {
          console.error('Failed to fetch albums');
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setIsLoadingAlbums(false);
      }
    }
    fetchAlbums();
  }, []);

  const handlePurchase = async (album: PurchasableAlbum) => {
    if (!album.availableForPurchase) {
      alert('This album is not available for purchase at this time.');
      return;
    }

    if (!album.price) {
      alert('Price information is not available for this album.');
      return;
    }

    setIsLoading(album.title);

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          albumId: album.id,
          albumTitle: album.title,
          price: album.price,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Error initiating purchase. Please try again.');
      setIsLoading(null);
    }
  };

  const availableAlbums = albums.filter(album => album.availableForPurchase === true);
  const unavailableAlbums = albums.filter(album => !album.availableForPurchase);

  if (isLoadingAlbums) {
    return (
      <main className="min-h-screen bg-black text-[#bc7d30]">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">Purchase Albums</h1>
          <p className="text-center text-[#bc7d30]/60">Loading albums...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-8">Purchase Albums</h1>
        <p className="text-lg mb-12 text-[#bc7d30]/80">
          Purchase lossless WAV downloads of select albums
        </p>
        <p>to do: <ul><li>add square integration</li>
        <li>find out if kip wants to sell physical items as well. If so, add that to the checkout page.</li>
        
        
        </ul></p>

        {/* Available Albums */}
        {availableAlbums.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Available for Purchase</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableAlbums.map((album) => (
                <div
                  key={album.id}
                  className="border border-[#bc7d30]/30 rounded-lg p-6 hover:border-[#bc7d30]/60 transition-colors bg-black"
                >
                  <h3 className="text-2xl font-bold mb-2 text-[#bc7d30]">
                    {album.title}
                  </h3>
                  {album.artist && (
                    <p className="text-[#bc7d30]/80 mb-2">{album.artist}</p>
                  )}
                  {album.year && (
                    <p className="text-sm text-[#bc7d30]/60 mb-4">{album.year}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-2xl font-bold text-[#bc7d30]">
                      ${album.price ? album.price.toFixed(2) : 'N/A'}
                    </span>
                    <button
                      onClick={() => handlePurchase(album)}
                      disabled={isLoading === album.title}
                      className="px-6 py-2 bg-[#bc7d30] text-black font-bold rounded-lg hover:bg-[#bc7d30]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading === album.title ? 'Processing...' : 'Purchase'}
                    </button>
                  </div>
                  <p className="text-xs text-[#bc7d30]/60 mt-2">Lossless WAV Download</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unavailable Albums */}
        {unavailableAlbums.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-6">Not Available for Purchase</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {unavailableAlbums.map((album) => (
                <div
                  key={album.id}
                  className="border border-[#bc7d30]/20 rounded-lg p-6 opacity-60 bg-black"
                >
                  <h3 className="text-2xl font-bold mb-2 text-[#bc7d30]">
                    {album.title}
                  </h3>
                  {(album.artist || album.by) && (
                    <p className="text-[#bc7d30]/80 mb-2">{album.artist || album.by}</p>
                  )}
                  {album.year && (
                    <p className="text-sm text-[#bc7d30]/60 mb-4">{album.year}</p>
                  )}
                  <p className="text-sm text-[#bc7d30]/60 mt-4">Not available for digital purchase</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
