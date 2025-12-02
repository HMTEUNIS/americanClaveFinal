'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { generatePlayerSlug } from '@/lib/utils';

interface PlayerCardProps {
  name: string;
  role?: string; // Instrument/role from junction table
  albums?: string[];
  picture?: string | null; // Player picture URL
}

export default function PlayerCard({ name, role, albums, picture }: PlayerCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const slug = generatePlayerSlug(name);
    router.push(`/players/${slug}`);
  };

  // Use placeholder if no picture provided
  const imageUrl = picture || '/profileplaceholder.jpg';

  return (
    <div 
      className="border border-[#bc7d30]/30 rounded-lg p-6 hover:border-[#bc7d30]/60 transition-colors bg-black cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* Player Info */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2 text-[#bc7d30]">
            {name}
          </h3>
          {role && (
            <p className="text-[#bc7d30]/80 mb-2">{role}</p>
          )}
          {albums && albums.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-[#bc7d30]/60 mb-1">Albums:</p>
              <ul className="text-sm text-[#bc7d30]/80">
                {albums.map((album, index) => (
                  <li key={index}>• {album}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Player Picture */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-[#bc7d30]/30">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="80px"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}

