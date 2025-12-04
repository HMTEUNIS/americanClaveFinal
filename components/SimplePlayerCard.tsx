'use client';

import { useRouter } from 'next/navigation';
import { generatePlayerSlug } from '@/lib/utils';

interface SimplePlayerCardProps {
  name: string;
  role?: string;
}

export default function SimplePlayerCard({ name, role }: SimplePlayerCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const slug = generatePlayerSlug(name);
    router.push(`/players/${slug}`);
  };

  return (
    <div 
      className="border border-[#bc7d30]/30 rounded-lg p-4 hover:border-[#bc7d30]/60 transition-colors bg-black cursor-pointer"
      onClick={handleClick}
    >
      <h3 className="text-xl font-bold text-[#bc7d30]">
        {name}
      </h3>
      {role && (
        <p className="text-sm text-[#bc7d30]/80 mt-1">{role}</p>
      )}
    </div>
  );
}

