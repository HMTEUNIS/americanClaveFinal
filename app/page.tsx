import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-[#bc7d30]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-center">
          {/* Image on the left */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/kiporange.jpg"
              alt="Kip Hanrahan"
              width={1000}
              height={1000}
              className="w-full max-w-2xl h-auto rounded-lg"
              priority
            />
          </div>

          {/* Text on the right */}
          <div className="text-lg md:text-xl leading-relaxed">
            <p className="mb-15">
              American Clavé is a label (a label? a record company? a form? a box?) of music colored by my friend Kip Hanrahan, whether produced or directed or written by or with some rather remarkable fellow artists (artists made somehow yet more remarkable by the mere presence of Kip's unique take on things), the music is deep, intelligent and always passionate ... deeply passionate.
            </p>
            <p className="mb-15">
              Perhaps in the same way that Kip's conversation tends toward a stream of consciousness, a stream of images, a myriad of rhythms, voices and sound somehow unite in some truly profound and meaningful way.
            </p>
            <p>
              Nothing is hidden, yet there is so much to be discovered.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
