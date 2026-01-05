'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FlickrPhoto,
  getPhotosByTag,
  getFlickrPhotoUrl,
} from '@/lib/flickr';

export default function TagFilterPage() {
  const params = useParams();
  const tag = decodeURIComponent(params.tag as string);

  const [photos, setPhotos] = useState<FlickrPhoto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [direction, setDirection] = useState(0);

  // Fetch photos for this tag
  useEffect(() => {
    async function loadPhotos() {
      try {
        const tagPhotos = await getPhotosByTag(tag);
        setPhotos(tagPhotos);
        setLoading(false);
      } catch (error) {
        console.error('Error loading photos for tag:', error);
        setLoading(false);
      }
    }
    loadPhotos();
  }, [tag]);

  // Preload adjacent photos
  useEffect(() => {
    if (photos.length === 0) return;

    const preloadImage = (index: number, size: 'xlarge' | 'large') => {
      if (index < 0 || index >= photos.length) return;
      const img = document.createElement('img');
      img.src = getFlickrPhotoUrl(photos[index], size);
    };

    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    const nextIndex = (currentIndex + 1) % photos.length;

    preloadImage(prevIndex, 'xlarge');
    preloadImage(nextIndex, 'xlarge');
    preloadImage(currentIndex, 'large');
  }, [currentIndex, photos]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (photos.length === 0) return;
    setDirection(1);
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const goToPrevious = useCallback(() => {
    if (photos.length === 0) return;
    setDirection(-1);
    setImageLoaded(false);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      goToNext();
    }
    if (touchStart - touchEnd < -75) {
      goToPrevious();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-400 text-lg"
        >
          Loading photos...
        </motion.div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-zinc-400 text-lg text-center px-4">
          <p className="mb-4">No photos found with tag &quot;{tag}&quot;</p>
          <Link
            href="/tags"
            className="text-white/80 hover:text-white transition-colors"
          >
            Back to all tags
          </Link>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];
  const photoUrl = getFlickrPhotoUrl(currentPhoto, 'xlarge');

  // Slide animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <div
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent"
      >
        <Link
          href="/"
          className="text-white text-xl font-light tracking-wider hover:text-white/80 transition-colors"
        >
          Portfolio
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/albums"
            className="text-white/80 hover:text-white transition-colors text-sm tracking-wide"
          >
            Albums
          </Link>
          <Link
            href="/tags"
            className="text-white text-sm tracking-wide border-b-2 border-white pb-1"
          >
            Tags
          </Link>
          <Link
            href="/map"
            className="text-white/80 hover:text-white transition-colors text-sm tracking-wide"
          >
            Map
          </Link>
        </div>
      </motion.nav>

      {/* Main Photo Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPhoto.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative w-full h-full">
              <Image
                src={photoUrl}
                alt={currentPhoto.title || 'Portfolio photo'}
                fill
                className="object-contain"
                priority={currentIndex === 0}
                onLoad={() => setImageLoaded(true)}
                sizes="100vw"
                unoptimized
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Loading indicator */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-500 text-sm"
            >
              Loading...
            </motion.div>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={goToPrevious}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-40 text-white/60 hover:text-white transition-all hover:scale-110"
        aria-label="Previous photo"
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </motion.button>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={goToNext}
        className="fixed right-6 top-1/2 -translate-y-1/2 z-40 text-white/60 hover:text-white transition-all hover:scale-110"
        aria-label="Next photo"
      >
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.button>

      {/* Photo Info Bar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/90 to-transparent px-6 py-8"
      >
        <div className="flex items-end justify-between">
          <div className="flex-1 max-w-2xl">
            {currentPhoto.title && (
              <h2 className="text-white text-xl font-light mb-2">
                {currentPhoto.title}
              </h2>
            )}
            {currentPhoto.datetaken && (
              <p className="text-zinc-400 text-sm">
                {new Date(currentPhoto.datetaken).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-6">
            <span className="text-zinc-400 text-sm font-mono">
              {currentIndex + 1} / {photos.length}
            </span>
            <Link
              href={`/photo/${currentPhoto.id}`}
              className="text-white/80 hover:text-white transition-colors text-sm tracking-wide uppercase"
            >
              Details
            </Link>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
