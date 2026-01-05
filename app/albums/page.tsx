'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  FlickrAlbum,
  getPortfolioAlbums,
  getFlickrPhotoUrl,
} from '@/lib/flickr';

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<FlickrAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlbums() {
      try {
        const portfolioAlbums = await getPortfolioAlbums();
        setAlbums(portfolioAlbums);
        setLoading(false);
      } catch (error) {
        console.error('Error loading albums:', error);
        setLoading(false);
      }
    }

    loadAlbums();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-400 text-lg"
        >
          Loading albums...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-sm border-b border-zinc-900"
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
            className="text-white text-sm tracking-wide border-b-2 border-white pb-1"
          >
            Albums
          </Link>
          <Link
            href="/tags"
            className="text-white/80 hover:text-white transition-colors text-sm tracking-wide"
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

      {/* Albums Grid */}
      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {albums.length === 0 ? (
          <div className="text-center text-zinc-400 py-20">
            <p className="mb-4">No albums with portfolio photos found.</p>
            <p className="text-sm text-zinc-500">
              Create albums on Flickr and tag photos with &quot;portfolio&quot; to
              display them here.
            </p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {albums.map((album) => {
              // Construct album cover URL
              const coverUrl = `https://farm${album.farm}.staticflickr.com/${album.server}/${album.primary}_${album.secret}_b.jpg`;

              return (
                <motion.div
                  key={album.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <Link
                    href={`/albums/${album.id}`}
                    className="group block relative aspect-[4/3] overflow-hidden rounded-lg bg-zinc-900"
                  >
                    {/* Album Cover Image */}
                    <Image
                      src={coverUrl}
                      alt={album.title._content}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {/* Album Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white text-xl font-light mb-2 group-hover:text-zinc-100 transition-colors">
                        {album.title._content}
                      </h3>
                      <p className="text-zinc-400 text-sm">
                        {album.photos} photo{album.photos !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Hover Arrow */}
                    <div className="absolute top-6 right-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
