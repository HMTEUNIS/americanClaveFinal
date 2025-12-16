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
        {/* Container - spans from image left to same distance from right, height fits logo */}
        <div className="absolute bottom-0 left-4 md:left-6 right-4 md:right-6" style={{ height: '70px' }}>
          {/* Logo section with solid black background */}
          <div className="relative w-96 md:w-[512px] h-[70px] bg-black inline-block" style={{ margin: 0, padding: 0, lineHeight: 0 }}>
            <Image
              src="/american-clave-lg-white.jpg"
              alt="American Clavé"
              width={512}
              height={512}
              className="w-full h-full object-contain"
              style={{ display: 'block', margin: 0, padding: 0 }}
              priority
              unoptimized
            />
          </div>
          {/* Gradient fade overlay - starts from black (after logo), fades to transparent, matches logo height */}
          <div 
            className="absolute bg-gradient-to-r from-black to-transparent left-96 md:left-[512px] right-0 h-[70px] rounded-r-lg"
            style={{ 
              top: 0
            }}
          >
          </div>
          {/* Silver underline - solid under logo, gradient fade after */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-0.5 bg-[#C0C0C0] w-96 md:w-[512px]"></div>
            <div 
              className="h-0.5 bg-gradient-to-r from-[#C0C0C0] to-transparent absolute top-0 left-96 md:left-[512px] right-0 rounded-r-full" 
            ></div>
          </div>
        </div>
      </div>
    </main>
  );
}
