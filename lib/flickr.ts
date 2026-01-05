/**
 * Flickr API Service
 * Handles all interactions with the Flickr API
 */

// TypeScript interfaces for Flickr API responses
export interface FlickrPhoto {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  datetaken?: string;
  datetakengranularity?: number;
  datetakenunknown?: number;
  tags?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  views?: string;
  url_o?: string;
  height_o?: number;
  width_o?: number;
}

export interface FlickrPhotoInfo {
  id: string;
  title: { _content: string };
  description: { _content: string };
  dates: {
    taken: string;
    takengranularity: number;
    takenunknown: string;
    lastupdate: string;
  };
  views: string;
  tags: {
    tag: Array<{
      id: string;
      raw: string;
      _content: string;
    }>;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface FlickrExif {
  tagspace: string;
  tagspaceid: number;
  tag: string;
  label: string;
  raw: { _content: string };
}

export interface FlickrAlbum {
  id: string;
  title: { _content: string };
  description: { _content: string };
  photos: number;
  primary: string;
  secret: string;
  server: string;
  farm: number;
}

const FLICKR_API_BASE = 'https://www.flickr.com/services/rest/';

/**
 * Build Flickr photo URL for different sizes
 * https://www.flickr.com/services/api/misc.urls.html
 */
export function getFlickrPhotoUrl(
  photo: FlickrPhoto,
  size: 'thumbnail' | 'medium' | 'large' | 'xlarge' | 'original' = 'large'
): string {
  const { server, id, secret, farm } = photo;

  // Size suffixes: https://www.flickr.com/services/api/misc.urls.html
  const sizeSuffix = {
    thumbnail: '_q', // 150x150 square
    medium: '_c',    // 800px on longest side
    large: '_b',     // 1024px on longest side
    xlarge: '_b',    // Use _b (1024px) - more reliable than _h
    original: '_o'   // original size
  };

  // If original URL is available, use it for original size
  if (size === 'original' && photo.url_o) {
    return photo.url_o;
  }

  const suffix = sizeSuffix[size];
  return `https://farm${farm}.staticflickr.com/${server}/${id}_${secret}${suffix}.jpg`;
}

/**
 * Fetch photos tagged with 'portfolio' from Flickr
 */
export async function getPortfolioPhotos(limit: number = 100): Promise<FlickrPhoto[]> {
  const params = new URLSearchParams({
    method: 'flickr.photos.search',
    api_key: process.env.NEXT_PUBLIC_FLICKR_API_KEY || '',
    user_id: process.env.NEXT_PUBLIC_FLICKR_USER_ID || '',
    tags: 'portfolio',
    tag_mode: 'all',
    extras: 'date_taken,tags,geo,views,url_o',
    per_page: limit.toString(),
    format: 'json',
    nojsoncallback: '1',
    sort: 'date-taken-desc'
  });

  console.log('Fetching portfolio photos from Flickr...');
  const response = await fetch(`${FLICKR_API_BASE}?${params}`);
  const data = await response.json();

  console.log('Flickr API response:', data);

  if (data.stat !== 'ok') {
    console.error('Flickr API error:', data.message);
    throw new Error(`Flickr API error: ${data.message}`);
  }

  const photos = data.photos?.photo || [];
  console.log(`Found ${photos.length} portfolio photos`);
  return photos;
}

/**
 * Get detailed information about a specific photo
 */
export async function getPhotoInfo(photoId: string): Promise<FlickrPhotoInfo> {
  const params = new URLSearchParams({
    method: 'flickr.photos.getInfo',
    api_key: process.env.NEXT_PUBLIC_FLICKR_API_KEY || '',
    photo_id: photoId,
    format: 'json',
    nojsoncallback: '1'
  });

  const response = await fetch(`${FLICKR_API_BASE}?${params}`);
  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(`Flickr API error: ${data.message}`);
  }

  return data.photo;
}

/**
 * Get EXIF data for a photo
 */
export async function getPhotoExif(photoId: string): Promise<FlickrExif[]> {
  const params = new URLSearchParams({
    method: 'flickr.photos.getExif',
    api_key: process.env.NEXT_PUBLIC_FLICKR_API_KEY || '',
    photo_id: photoId,
    format: 'json',
    nojsoncallback: '1'
  });

  const response = await fetch(`${FLICKR_API_BASE}?${params}`);
  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(`Flickr API error: ${data.message}`);
  }

  return data.photo.exif || [];
}

/**
 * Get user's photosets (albums)
 */
export async function getUserAlbums(): Promise<FlickrAlbum[]> {
  const params = new URLSearchParams({
    method: 'flickr.photosets.getList',
    api_key: process.env.NEXT_PUBLIC_FLICKR_API_KEY || '',
    user_id: process.env.NEXT_PUBLIC_FLICKR_USER_ID || '',
    format: 'json',
    nojsoncallback: '1'
  });

  const response = await fetch(`${FLICKR_API_BASE}?${params}`);
  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(`Flickr API error: ${data.message}`);
  }

  return data.photosets.photoset;
}

/**
 * Get photos from a specific album (filtered by portfolio tag)
 */
export async function getAlbumPhotos(albumId: string): Promise<FlickrPhoto[]> {
  const params = new URLSearchParams({
    method: 'flickr.photosets.getPhotos',
    api_key: process.env.NEXT_PUBLIC_FLICKR_API_KEY || '',
    photoset_id: albumId,
    user_id: process.env.NEXT_PUBLIC_FLICKR_USER_ID || '',
    extras: 'date_taken,tags,geo,views,url_o',
    format: 'json',
    nojsoncallback: '1'
  });

  const response = await fetch(`${FLICKR_API_BASE}?${params}`);
  const data = await response.json();

  if (data.stat !== 'ok') {
    throw new Error(`Flickr API error: ${data.message}`);
  }

  // Filter to only photos with 'portfolio' tag
  return data.photoset.photo.filter((photo: FlickrPhoto) =>
    photo.tags?.includes('portfolio')
  );
}

/**
 * Get albums that contain at least one portfolio-tagged photo
 */
export async function getPortfolioAlbums(): Promise<FlickrAlbum[]> {
  const albums = await getUserAlbums();
  const portfolioAlbums: FlickrAlbum[] = [];

  // Check each album for portfolio-tagged photos
  for (const album of albums) {
    const photos = await getAlbumPhotos(album.id);
    if (photos.length > 0) {
      portfolioAlbums.push(album);
    }
  }

  return portfolioAlbums;
}
