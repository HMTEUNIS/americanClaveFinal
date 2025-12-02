'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getFrontCoverUrl } from '@/lib/r2-images';

interface AlbumCardProps {
  id: number;
  title: string;
  year?: number;
  artist?: string;
  catno?: string; // Catalog number for R2 image URLs
}

export default function AlbumCard({ id, title, year, artist, catno }: AlbumCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/music/${id}`);
  };

  const frontCoverUrl = catno ? getFrontCoverUrl(catno) : null;
  // Use placeholder if no cover URL
  const imageUrl = frontCoverUrl || '/albumplaceholder.jpg';

  return (
    <div 
      className="border border-[#bc7d30]/30 rounded-lg overflow-hidden hover:border-[#bc7d30]/60 transition-colors bg-black cursor-pointer"
      onClick={handleClick}
    >
      {/* Album Cover Image */}
      <div className="relative w-full aspect-square">
        <Image
          src={imageUrl}
          alt={`${title} cover`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          onError={(e) => {
            // If the placeholder also fails, hide the image
            if (imageUrl !== '/albumplaceholder.jpg') {
              // Try placeholder as fallback
              e.currentTarget.src = '/albumplaceholder.jpg';
            } else {
              // Hide image if placeholder also fails
              console.error('Image failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
            }
          }}
        />
      </div>
      
      {/* Album Info */}
      <div className="p-6">
        <h3 className="text-2xl font-bold mb-2 text-[#bc7d30]">
          {title}
        </h3>
        {artist && (
          <p className="text-[#bc7d30]/80 mb-1">{artist}</p>
        )}
        {year && (
          <p className="text-sm text-[#bc7d30]/60">{year}</p>
        )}
      </div>
    </div>
  );
}

