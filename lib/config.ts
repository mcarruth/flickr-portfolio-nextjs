/**
 * Application configuration helpers
 */

/**
 * Get the list of tags that should be displayed as "albums"
 * These are curated categories defined by the user in their .env.local file
 */
export function getAlbumTags(): string[] {
  const tags = process.env.NEXT_PUBLIC_ALBUM_TAGS || '';
  return tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * Check if any album tags are configured
 * Used to conditionally show the Albums navigation link
 */
export function hasAlbumTags(): boolean {
  return getAlbumTags().length > 0;
}
