'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const handleNavigation = () => {
    router.push('/home');
  };

  // Handle Enter key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNavigation();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <main 
      className="relative min-h-screen w-full overflow-hidden cursor-pointer"
      onClick={handleNavigation}
      role="button"
      tabIndex={0}
      aria-label="Click or press Enter to continue to music page"
    >
      {/* Full-screen GIF background */}
      <div className="fixed inset-0 w-full h-full z-0">
        <img
          src="https://www.dropbox.com/scl/fi/9l3yc3bdb5eev5xhh83bg/homepage.gif?rlkey=r8efkcbdt4796w1k34d7az405&st=4y8lvd64&dl=1"
          alt="American Clavé"
          className="w-full h-full object-cover"
          style={{ position: 'absolute', inset: 0 }}
        />
      </div>

      {/* American Clavé logo - bottom left with silver underline */}
      <div className="fixed bottom-5 left-0 right-0 z-10">
        {/* Black box - matches image height, spans from image left to same distance from right */}
        <div className="absolute bottom-0 left-4 md:left-6 right-4 md:right-6 bg-black flex items-end">
          {/* Image positioned at left */}
          <div className="relative w-96 md:w-[512px] h-auto">
            <Image
              src="/american-clave-lg-white.jpg"
              alt="American Clavé"
              width={512}
              height={512}
              className="w-full h-auto"
              priority
              unoptimized
            />
          </div>
          {/* Silver underline - below the box */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C0C0C0]" style={{ transform: 'translateY(100%)' }}></div>
        </div>
      </div>
    </main>
  );
}
