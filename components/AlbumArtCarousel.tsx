'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AlbumArtCarouselProps {
  images: string[];
  albumTitle: string;
}

export default function AlbumArtCarousel({ images, albumTitle }: AlbumArtCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Check which images actually exist by trying to load them
  useEffect(() => {
    if (!images || images.length === 0) {
      setAvailableImages([]);
      return;
    }

    const validImages: string[] = [];
    let checkedCount = 0;

    const checkImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new window.Image();
        
        img.onload = () => {
          validImages.push(url);
          checkedCount++;
          console.log(`Carousel - Image loaded successfully: ${url}`);
          if (checkedCount === images.length) {
            console.log('Carousel - Total images checked:', images.length);
            console.log('Carousel - Valid images found:', validImages.length);
            console.log('Carousel - Valid image URLs:', validImages);
            setAvailableImages([...validImages]);
            if (validImages.length > 0 && currentIndex >= validImages.length) {
              setCurrentIndex(0);
            }
          }
          resolve();
        };
        
        img.onerror = () => {
          checkedCount++;
          console.log(`Carousel - Image failed to load: ${url}`);
          if (checkedCount === images.length) {
            console.log('Carousel - Total images checked:', images.length);
            console.log('Carousel - Valid images found:', validImages.length);
            console.log('Carousel - Valid image URLs:', validImages);
            setAvailableImages([...validImages]);
            if (validImages.length > 0 && currentIndex >= validImages.length) {
              setCurrentIndex(0);
            }
          }
          resolve();
        };
        
        img.src = url;
      });
    };

    // Check all images
    images.forEach(url => checkImage(url));
  }, [images]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (!images || images.length === 0 || availableImages.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? availableImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === availableImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleImageDoubleClick = () => {
    setModalImageIndex(currentIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalImageIndex((prev) => 
      prev === 0 ? availableImages.length - 1 : prev - 1
    );
  };

  const handleModalNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalImageIndex((prev) => 
      prev === availableImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      <div className="relative w-full">
        {/* Main Image */}
        <div 
          className="relative aspect-square w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-[#bc7d30]/30 bg-black/50 cursor-pointer"
          onDoubleClick={handleImageDoubleClick}
          title="Double-click to view full size"
        >
          {availableImages.length > 0 && (
            <Image
              src={availableImages[currentIndex]}
              alt={`${albumTitle} - Art ${currentIndex + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              unoptimized
            />
          )}
        </div>

      {/* Navigation Arrows */}
      {availableImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-[#bc7d30] p-2 rounded-full transition-colors z-10"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-[#bc7d30] p-2 rounded-full transition-colors z-10"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {availableImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {availableImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex 
                  ? 'bg-[#bc7d30]' 
                  : 'bg-[#bc7d30]/30 hover:bg-[#bc7d30]/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
      </div>

      {/* Full Size Image Modal */}
      {isModalOpen && availableImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-[#bc7d30] hover:text-[#bc7d30]/80 transition-colors z-10 bg-black/70 rounded-full p-2"
            aria-label="Close"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {availableImages.length > 1 && (
            <button
              onClick={handleModalPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-[#bc7d30] p-3 rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next Button */}
          {availableImages.length > 1 && (
            <button
              onClick={handleModalNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-[#bc7d30] p-3 rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Full Size Image */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={availableImages[modalImageIndex]}
              alt={`${albumTitle} - Art ${modalImageIndex + 1} (Full Size)`}
              width={2000}
              height={2000}
              className="max-w-full max-h-full object-contain"
              unoptimized
              priority
            />
          </div>

          {/* Image Counter */}
          {availableImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-[#bc7d30] px-4 py-2 rounded-lg text-sm">
              {modalImageIndex + 1} / {availableImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

