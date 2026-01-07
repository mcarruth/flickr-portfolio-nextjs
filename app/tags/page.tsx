'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TagWithCount, getBrowsingTags } from '@/lib/flickr';
import { getAlbumTags, hasAlbumTags } from '@/lib/config';

export default function TagsPage() {
  const [tags, setTags] = useState<TagWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const showAlbums = hasAlbumTags();

  useEffect(() => {
    async function loadTags() {
      try {
        const albumTags = getAlbumTags();
        const browsingTags = await getBrowsingTags(albumTags);
        setTags(browsingTags);
        setLoading(false);
      } catch (error) {
        console.error('Error loading tags:', error);
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-400 text-lg"
        >
          Loading tags...
        </motion.div>
      </div>
    );
  }

  if (tags.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <div className="text-zinc-400 text-lg text-center px-4">
          <p>No tags found in portfolio photos.</p>
        </div>
      </div>
    );
  }

  // Calculate font sizes based on count (min: 0.875rem, max: 3rem)
  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));
  const getTagSize = (count: number) => {
    if (maxCount === minCount) return 1.5; // All tags same count
    const normalized = (count - minCount) / (maxCount - minCount);
    return 0.875 + normalized * 2.125; // 0.875rem to 3rem
  };

  // Shuffle tags for cloud effect (deterministic shuffle based on tag names)
  const shuffledTags = [...tags].sort((a, b) => {
    // Use tag name for consistent but "random" looking order
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black via-black to-transparent"
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

      {/* Main Content */}
      <div className="pt-24 px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <h1 className="text-4xl font-light mb-3 tracking-wide">
            Browse by Tag
          </h1>
          <p className="text-zinc-400 mb-12">
            Explore {tags.length} {tags.length === 1 ? 'tag' : 'tags'} across
            the portfolio
          </p>

          {/* Tag Cloud */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4 items-center justify-center py-12"
          >
            {shuffledTags.map((tag, index) => {
              const fontSize = getTagSize(tag.count);
              return (
                <motion.div
                  key={tag.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.02 }}
                >
                  <Link
                    href={`/tags/${encodeURIComponent(tag.name)}`}
                    className="group relative inline-block transition-all hover:scale-110"
                    style={{ fontSize: `${fontSize}rem` }}
                  >
                    <span className="text-white/70 group-hover:text-white transition-colors font-light">
                      {tag.name}
                    </span>
                    <span className="ml-2 text-zinc-600 group-hover:text-zinc-400 transition-colors text-xs align-super">
                      {tag.count}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
