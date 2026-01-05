'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  FlickrPhotoInfo,
  FlickrExif,
  getPhotoInfo,
  getPhotoExif,
} from '@/lib/flickr';

interface ExifPanelProps {
  photoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExifPanel({ photoId, isOpen, onClose }: ExifPanelProps) {
  const [photoInfo, setPhotoInfo] = useState<FlickrPhotoInfo | null>(null);
  const [exifData, setExifData] = useState<FlickrExif[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function loadPhotoDetails() {
      setLoading(true);
      try {
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
  }, [photoId, isOpen]);

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
    'Location',
    'City',
    'Country',
    'State',
    'Province',
  ];

  const safeExifData = exifData.filter((exif) =>
    safeExifTags.includes(exif.tag)
  );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-black/95 backdrop-blur-sm border-l border-zinc-800 overflow-y-auto z-50"
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-zinc-400">Loading details...</div>
              </div>
            ) : (
              <div className="p-8">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
                  aria-label="Close panel"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

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

                {/* All EXIF Data (collapsed section) */}
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
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
