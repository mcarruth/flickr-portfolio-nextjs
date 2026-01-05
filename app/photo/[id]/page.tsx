'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  FlickrPhoto,
  FlickrPhotoInfo,
  FlickrExif,
  getPortfolioPhotos,
  getPhotoInfo,
  getPhotoExif,
  getFlickrPhotoUrl,
} from '@/lib/flickr';

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params.id as string;

  const [photo, setPhoto] = useState<FlickrPhoto | null>(null);
  const [photoInfo, setPhotoInfo] = useState<FlickrPhotoInfo | null>(null);
  const [exifData, setExifData] = useState<FlickrExif[]>([]);
  const [showExif, setShowExif] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhotoDetails() {
      try {
        // Get the photo from portfolio photos
        const portfolioPhotos = await getPortfolioPhotos();
        const currentPhoto = portfolioPhotos.find((p) => p.id === photoId);

        if (!currentPhoto) {
          router.push('/');
          return;
        }

        setPhoto(currentPhoto);

        // Load additional info and EXIF data
        const [info, exif] = await Promise.all([
          getPhotoInfo(photoId),
          getPhotoExif(photoId),
        ]);

        setPhotoInfo(info);
        setExifData(exif);
        setLoading(false);
      } catch (error) {
        console.error('Error loading photo details:', error);
        setLoading(false);
      }
    }

    loadPhotoDetails();
  }, [photoId, router]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      } else if (e.key === 'e' || e.key === 'E') {
        setShowExif((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  if (loading || !photo) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-400 text-lg"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  const photoUrl = getFlickrPhotoUrl(photo, 'large');

  // Extract key EXIF fields
  const getExifValue = (tag: string) => {
    const exif = exifData.find((e) => e.tag === tag);
    return exif?.raw?._content || null;
  };

  const camera = getExifValue('Model');
  const lens = getExifValue('LensModel');
  const focalLength = getExifValue('FocalLength');
  const aperture = getExifValue('FNumber');
  const shutterSpeed = getExifValue('ExposureTime');
  const iso = getExifValue('ISO');

  // Whitelist of safe EXIF fields to display (excludes serial numbers, device IDs, exact GPS, etc.)
  const safeExifTags = [
    'Make',
    'Model',
    'LensModel',
    'FocalLength',
    'FNumber',
    'ExposureTime',
    'ISO',
    'ExposureProgram',
    'MeteringMode',
    'Flash',
    'WhiteBalance',
    'ColorSpace',
    'ExposureBiasValue',
    'MaxApertureValue',
    'SubjectDistance',
    'FocalLengthIn35mmFormat',
    'SceneCaptureType',
    'Contrast',
    'Saturation',
    'Sharpness',
    'DateTimeOriginal',
    'Software',
    // Location info (city/region only, not exact GPS)
    'Location',
    'City',
    'Country',
    'State',
    'Province',
  ];

  // Filter EXIF data to only safe fields
  const safeExifData = exifData.filter((exif) =>
    safeExifTags.includes(exif.tag)
  );

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
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

      {/* Show/Hide Details Button - Separate from nav */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowExif(!showExif)}
        className="fixed top-6 right-6 z-50 text-white/80 hover:text-white transition-colors text-sm tracking-wide bg-black/50 px-4 py-2 rounded backdrop-blur-sm"
      >
        {showExif ? 'Hide' : 'Show'} Details
      </motion.button>

      {/* Main Photo */}
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={photoUrl}
          alt={photo.title || 'Portfolio photo'}
          fill
          className="object-contain"
          priority
          sizes="100vw"
        />
      </div>

      {/* EXIF Overlay */}
      <AnimatePresence>
        {showExif && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black/95 backdrop-blur-sm border-l border-zinc-800 overflow-y-auto z-40"
          >
            <div className="p-8">
              {/* Photo Title & Description */}
              <div className="mb-8">
                {photoInfo?.title?._content && (
                  <h1 className="text-white text-2xl font-light mb-3">
                    {photoInfo.title._content}
                  </h1>
                )}
                {photoInfo?.description?._content && (
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {photoInfo.description._content}
                  </p>
                )}
              </div>

              {/* Key EXIF Data */}
              <div className="space-y-6 mb-8">
                <h2 className="text-white text-sm font-medium uppercase tracking-wider mb-4">
                  Camera Settings
                </h2>

                {camera && (
                  <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                      Camera
                    </div>
                    <div className="text-white text-lg font-light">{camera}</div>
                  </div>
                )}

                {lens && (
                  <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                      Lens
                    </div>
                    <div className="text-white text-lg font-light">{lens}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {focalLength && (
                    <div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        Focal Length
                      </div>
                      <div className="text-white text-base">{focalLength}</div>
                    </div>
                  )}

                  {aperture && (
                    <div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        Aperture
                      </div>
                      <div className="text-white text-base">f/{aperture}</div>
                    </div>
                  )}

                  {shutterSpeed && (
                    <div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        Shutter Speed
                      </div>
                      <div className="text-white text-base">{shutterSpeed}s</div>
                    </div>
                  )}

                  {iso && (
                    <div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        ISO
                      </div>
                      <div className="text-white text-base">{iso}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Date & Stats */}
              {(photoInfo?.dates?.taken || photoInfo?.views) && (
                <div className="space-y-4 mb-8 pb-8 border-b border-zinc-800">
                  {photoInfo.dates?.taken && (
                    <div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        Date Taken
                      </div>
                      <div className="text-white text-base">
                        {new Date(photoInfo.dates.taken).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {photoInfo.views && (
                    <div>
                      <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">
                        Views
                      </div>
                      <div className="text-white text-base">
                        {parseInt(photoInfo.views).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Location section removed for privacy - city/region shows in EXIF data instead of exact GPS coordinates */}

              {/* All EXIF Data (collapsed section) - filtered for privacy */}
              {safeExifData.length > 0 && (
                <details className="group">
                  <summary className="text-zinc-500 text-xs uppercase tracking-wider mb-4 cursor-pointer hover:text-zinc-300 transition-colors">
                    All Technical Data ({safeExifData.length} fields)
                  </summary>
                  <div className="mt-4 space-y-3">
                    {safeExifData.map((exif, index) => (
                      <div key={index} className="text-sm">
                        <div className="text-zinc-500 text-xs mb-1">
                          {exif.label}
                        </div>
                        <div className="text-white/90 font-mono text-xs">
                          {exif.raw?._content}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* Tags */}
              {photoInfo?.tags?.tag && photoInfo.tags.tag.length > 0 && (
                <div className="mt-8 pt-8 border-t border-zinc-800">
                  <div className="text-zinc-500 text-xs uppercase tracking-wider mb-3">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {photoInfo.tags.tag.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/tags/${encodeURIComponent(tag.raw)}`}
                        className="px-3 py-1 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white text-xs rounded-full transition-colors"
                      >
                        {tag.raw}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
