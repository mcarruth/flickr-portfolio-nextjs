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
  url_q?: string;  // 150x150 square thumbnail
  url_z?: string;  // 640px on longest side
  url_c?: string;  // 800px on longest side
  url_b?: string;  // 1024px on longest side
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
 *
 * Note: Uses medium 640 (_z) as default for better compatibility with older photos.
 * Before May 2010, large sizes (_b) may not exist for all photos.
 */
export function getFlickrPhotoUrl(
  photo: FlickrPhoto,
  size: 'thumbnail' | 'medium' | 'large' | 'xlarge' | 'original' = 'large'
): string {
  // Prefer Flickr-provided URLs when available (uses live.staticflickr.com)
  // These are more reliable than constructing URLs with farm subdomains

  // Check for Flickr-provided URL based on size
  if (size === 'original' && photo.url_o) {
    return photo.url_o;
  }

  // For other sizes, check if Flickr provided the URL
  // url_q = 150x150 square, url_z = 640px, url_c = 800px, url_b = 1024px
  const flickrProvidedUrl =
    size === 'thumbnail' ? photo.url_q :
    size === 'medium' ? photo.url_z :
    size === 'large' ? photo.url_z :
    size === 'xlarge' ? photo.url_c || photo.url_b :
    undefined;

  if (flickrProvidedUrl) {
    return flickrProvidedUrl;
  }

  // Fallback: construct URL manually (less reliable for newer photos)
  const { server, id, secret, farm } = photo;
  const sizeSuffix = {
    thumbnail: '_q', // 150x150 square
    medium: '_z',    // 640px on longest side
    large: '_z',     // 640px
    xlarge: '_z',    // 640px
    original: '_o'   // original size
  };

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
    extras: 'date_taken,tags,geo,views,url_o,url_z,url_c,url_b,url_q',
    per_page: limit.toString(),
    format: 'json',
    nojsoncallback: '1',
    sort: 'date-posted-desc' // Sort by upload date to match flogr and flickr-portfolio
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

/**
 * Extract all unique tags from portfolio photos with their counts
 */
export interface TagWithCount {
  name: string;
  count: number;
}

export async function getPortfolioTags(): Promise<TagWithCount[]> {
  const photos = await getPortfolioPhotos();
  const tagCounts = new Map<string, number>();

  // Count occurrences of each tag
  photos.forEach((photo) => {
    if (photo.tags) {
      const tags = photo.tags.split(' ').filter(tag => tag && tag !== 'portfolio');
      tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });

  // Convert to array and sort by count (descending)
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get photos filtered by a specific tag
 */
export async function getPhotosByTag(tag: string): Promise<FlickrPhoto[]> {
  const photos = await getPortfolioPhotos();
  return photos.filter((photo) =>
    photo.tags?.split(' ').includes(tag)
  );
}

/**
 * Get photos that have geolocation data
 */
export async function getGeotaggedPhotos(): Promise<FlickrPhoto[]> {
  const photos = await getPortfolioPhotos();
  return photos.filter((photo) =>
    photo.latitude !== undefined &&
    photo.longitude !== undefined &&
    photo.latitude !== 0 &&
    photo.longitude !== 0
  );
}

/**
 * Tag-based album interface
 * Represents a virtual "album" based on a specific tag
 */
export interface TagBasedAlbum {
  tag: string;
  count: number;
  coverPhoto: FlickrPhoto | null;
}

/**
 * Get tag-based albums from ALBUM_TAGS configuration
 * Returns albums only for the tags specified in NEXT_PUBLIC_ALBUM_TAGS
 */
export async function getTagBasedAlbums(albumTags: string[]): Promise<TagBasedAlbum[]> {
  if (albumTags.length === 0) {
    return [];
  }

  const photos = await getPortfolioPhotos();
  const albums: TagBasedAlbum[] = [];

  // For each configured album tag, count photos and get cover photo
  for (const tag of albumTags) {
    const tagPhotos = photos.filter((photo) =>
      photo.tags?.split(' ').includes(tag)
    );

    albums.push({
      tag,
      count: tagPhotos.length,
      coverPhoto: tagPhotos.length > 0 ? tagPhotos[0] : null,
    });
  }

  return albums;
}

/**
 * Get portfolio tags excluding 'portfolio' and album tags
 * Used for the Tags page to show browsing tags only
 */
export async function getBrowsingTags(excludeTags: string[]): Promise<TagWithCount[]> {
  const photos = await getPortfolioPhotos();
  const tagCounts = new Map<string, number>();

  // Build exclusion set for faster lookup
  const excludeSet = new Set(['portfolio', ...excludeTags]);

  // Count occurrences of each tag (excluding portfolio and album tags)
  photos.forEach((photo) => {
    if (photo.tags) {
      const tags = photo.tags.split(' ').filter(tag => tag && !excludeSet.has(tag));
      tags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    }
  });

  // Convert to array and sort by count (descending)
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
