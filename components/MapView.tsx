'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';
import { FlickrPhoto, getFlickrPhotoUrl } from '@/lib/flickr';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to fit map bounds to all markers
function FitBounds({ photos }: { photos: FlickrPhoto[] }) {
  const map = useMap();

  useEffect(() => {
    if (photos.length === 0) return;

    const bounds = L.latLngBounds(
      photos.map((photo) => [photo.latitude!, photo.longitude!])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 16,
    });
  }, [map, photos]);

  return null;
}

interface MapViewProps {
  photos: FlickrPhoto[];
}

export default function MapView({ photos }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-400">Loading map...</div>
      </div>
    );
  }

  // Calculate center point (average of all coordinates)
  const centerLat =
    photos.length > 0
      ? photos.reduce((sum, photo) => sum + (photo.latitude || 0), 0) /
        photos.length
      : 0;
  const centerLng =
    photos.length > 0
      ? photos.reduce((sum, photo) => sum + (photo.longitude || 0), 0) /
        photos.length
      : 0;

  // Fallback to world center if calculation fails
  const finalCenter: [number, number] = [
    isNaN(centerLat) || centerLat === 0 ? 20 : centerLat,
    isNaN(centerLng) || centerLng === 0 ? 0 : centerLng,
  ];

  return (
    <div className="h-full w-full">
      <MapContainer
        center={finalCenter}
        zoom={2}
        className="h-full w-full"
        style={{ background: '#000' }}
      >
        {/* Dark themed map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Fit bounds to show all markers */}
        <FitBounds photos={photos} />

        {/* Markers for each photo */}
        {photos.map((photo) => {
          if (!photo.latitude || !photo.longitude) return null;

          return (
            <Marker
              key={photo.id}
              position={[photo.latitude, photo.longitude]}
              icon={icon}
            >
              <Popup maxWidth={400} minWidth={300} className="photo-popup">
                <div className="flex flex-col gap-2 p-2">
                  <div className="relative w-full h-64">
                    <Image
                      src={getFlickrPhotoUrl(photo, 'medium')}
                      alt={photo.title || 'Photo'}
                      fill
                      className="object-cover rounded"
                      sizes="400px"
                    />
                  </div>
                  {photo.title && (
                    <h3 className="font-medium text-sm">{photo.title}</h3>
                  )}
                  {photo.datetaken && (
                    <p className="text-xs text-zinc-600">
                      {new Date(photo.datetaken).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  )}
                  <Link
                    href={`/photo/${photo.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Photo count indicator */}
      <div className="fixed bottom-6 left-6 z-[1000] bg-black/80 backdrop-blur-sm border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm">
        {photos.length} {photos.length === 1 ? 'photo' : 'photos'} on map
      </div>

      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: white;
          border-radius: 8px;
          padding: 0;
          min-width: 320px;
        }
        .leaflet-popup-content {
          margin: 0;
          width: 100% !important;
          min-width: 320px;
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}
