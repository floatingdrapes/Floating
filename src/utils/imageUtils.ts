import { normalizeGoogleDriveUrl, isGoogleDriveUrl } from './googleDrive';

/**
 * Image optimization utility for Floating Drapes
 * Transforms image URLs (Unsplash, Google Drive, etc.) into optimal formats and dimensions.
 */
export function getOptimizedImageUrl(url: string, width = 600, quality = 75): string {
  if (!url || typeof url !== 'string') return url;

  const clean = url.trim();

  // If it's a Google Drive URL, convert to direct CDN format
  if (isGoogleDriveUrl(clean)) {
    return normalizeGoogleDriveUrl(clean);
  }

  // Check if it's an Unsplash URL
  if (clean.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(clean);
      urlObj.searchParams.set('auto', 'format,compress');
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      if (!urlObj.searchParams.has('fit')) {
        urlObj.searchParams.set('fit', 'crop');
      }
      return urlObj.toString();
    } catch {
      // String manipulation fallback
      const baseUrl = clean.split('?')[0];
      return `${baseUrl}?auto=format,compress&fm=webp&w=${width}&q=${quality}&fit=crop`;
    }
  }

  return clean;
}
