'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { FlickrPhoto, getGeotaggedPhotos } from '@/lib/flickr';
import { hasAlbumTags } from '@/lib/config';

// Dynamically import the map component to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-zinc-400 text-lg">Loading map...</div>
    </div>
  ),
});

export default function MapPage() {
  const [photos, setPhotos] = useState<FlickrPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const showAlbums = hasAlbumTags();

  useEffect(() => {
    async function loadGeotaggedPhotos() {
      try {
        const geotaggedPhotos = await getGeotaggedPhotos();
        setPhotos(geotaggedPhotos);
        setLoading(false);
      } catch (error) {
        console.error('Error loading geotagged photos:', error);
        setLoading(false);
      }
    }
    loadGeotaggedPhotos();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-400 text-lg"
        >
          Loading map...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black via-black to-transparent"
      >
        <Link
          href="/"
          className="text-white text-xl font-light tracking-wider hover:text-white/80 transition-colors"
        >
          Portfolio
        </Link>
        <div className="flex items-center gap-6">
          {showAlbums && (
            <Link
              href="/albums"
              className="text-white/80 hover:text-white transition-colors text-sm tracking-wide"
            >
              Albums
            </Link>
          )}
          <Link
            href="/tags"
            className="text-white/80 hover:text-white transition-colors text-sm tracking-wide"
          >
            Tags
          </Link>
          <Link
            href="/map"
            className="text-white text-sm tracking-wide border-b-2 border-white pb-1"
          >
            Map
          </Link>
        </div>
      </motion.nav>

      {/* Map or Empty State */}
      <div className="h-full pt-16">
        {photos.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-zinc-400 text-lg text-center px-4">
              <p className="mb-2">No geotagged photos found.</p>
              <p className="text-sm text-zinc-500">
                Add location data to your Flickr photos to see them on the map.
              </p>
            </div>
          </div>
        ) : (
          <MapView photos={photos} />
        )}
      </div>
    </div>
  );
}
