/**
 * Utility functions for detecting, extracting, and normalizing Google Drive URLs
 * into direct, universally embeddable image CDN links.
 */

/**
 * Extracts Google Drive file ID from various sharing and direct URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 * - https://drive.google.com/thumbnail?id=FILE_ID
 * - https://lh3.googleusercontent.com/d/FILE_ID
 * - https://docs.google.com/uc?id=FILE_ID
 */
export function extractGoogleDriveFileId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID (common sharing link)
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: id=FILE_ID or ?id=FILE_ID or &id=FILE_ID
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

  // Pattern 3: lh3.googleusercontent.com/d/FILE_ID
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
  if (lh3Match && lh3Match[1]) return lh3Match[1];

  // Pattern 4: /d/FILE_ID in any google domain
  const genericDMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (genericDMatch && genericDMatch[1]) return genericDMatch[1];

  return null;
}

/**
 * Checks if a string is a Google Drive URL or contains a Google Drive file ID
 */
export function isGoogleDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('lh3.googleusercontent.com/d/') ||
    Boolean(extractGoogleDriveFileId(trimmed))
  );
}

/**
 * Normalizes any Google Drive link to Google's official user content CDN URL.
 * https://lh3.googleusercontent.com/d/{fileId}
 * This link serves the raw image bytes with public caching headers, bypassing
 * HTML preview pages, cookie restrictions, and iframe blocks.
 * If not a Google Drive link, returns the original URL trimmed.
 */
export function normalizeGoogleDriveUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed;
}

/**
 * Secondary fallback for Google Drive images if direct CDN has permission flags
 */
export function getGoogleDriveThumbnailUrl(fileId: string, size = 1600): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}
