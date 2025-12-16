'use client';

import { useState } from 'react';
import PlayerAlbumsModal from './PlayerAlbumsModal';

interface SimplePlayerCardProps {
  name: string;
  role?: string;
}

export default function SimplePlayerCard({ name, role }: SimplePlayerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
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
      <PlayerAlbumsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        playerName={name}
      />
    </>
  );
}

