/**
 * Cloudflare R2 Image URL Helper
 * 
 * Album covers are stored in R2 with naming convention:
 * {catno}_{position}_cropped.jpg
 * 
 * Positions can be: front, back, inside&back, 1, 2, 3, 4, etc.
 * 
 * URL format: https://pub-2e173b57501f46d1b35ca8b2b67e30e6.r2.dev/{catno}_{position}_cropped.jpg
 */

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://pub-2e173b57501f46d1b35ca8b2b67e30e6.r2.dev';

/**
 * Extract numeric catalog number from catno string
 * All R2 images use 4-digit catalog numbers starting with "10"
 * 
 * Strategy:
 * 1. Find all numeric sequences
 * 2. Prefer numbers that start with "10" and are 4 digits
 * 3. If no "10xx" found, take any number and prepend "10" to make it 4 digits
 * 
 * Examples:
 * - "AMCL 1004" -> "1004" (already starts with 10)
 * - "SJR LP36" -> "1036" (prepend 10 to 36)
 * - "AMCL 1009LP/1008EP" -> "1009" (prefer first 10xx number)
 * - "36" -> "1036" (prepend 10)
 */
function extractNumericCatno(catno: string): string | null {
  // Find all numeric sequences in the catalog number
  const numericMatches = catno.match(/\d+/g);
  
  if (!numericMatches || numericMatches.length === 0) {
    return null;
  }
  
  // First, look for a 4-digit number starting with "10"
  for (const match of numericMatches) {
    if (match.length === 4 && match.startsWith('10')) {
      return match;
    }
  }
  
  // If no "10xx" found, look for any number that could be the catalog number
  // Prefer longer numbers, or numbers that are 2-3 digits (which we'll prepend "10" to)
  let bestMatch = numericMatches[0];
  for (const match of numericMatches) {
    // Prefer numbers that are 2-3 digits (will become 10xx)
    if (match.length >= 2 && match.length <= 3) {
      bestMatch = match;
      break;
    }
    // Or prefer longer numbers
    if (match.length > bestMatch.length) {
      bestMatch = match;
    }
  }
  
  // If the number is already 4 digits but doesn't start with 10, use it as-is
  // Otherwise, prepend "10" and pad to 4 digits
  if (bestMatch.length === 4) {
    return bestMatch;
  }
  
  // Prepend "10" and pad the rest to 2 digits
  const suffix = bestMatch.padStart(2, '0');
  return `10${suffix}`;
}

/**
 * Generate R2 image URL for album cover
 * @param catno - Catalog number from albums table (e.g., "AMCL 1004", "SJR CD77")
 * @param position - Position of the cover (front, back, inside&back, 1, 2, 3, etc.)
 * @returns Full URL to the image in R2
 */
export function getAlbumCoverUrl(catno: string, position: string): string {
  // Extract numeric catalog number from the catno string
  const numericCatno = extractNumericCatno(catno);
  
  if (!numericCatno) {
    console.warn(`Could not extract numeric catalog number from: "${catno}"`);
    // Fallback: use the original catno with spaces removed
    const safeCatno = catno.replace(/\s+/g, '');
    const safePosition = position === 'inside&back' ? 'inside&back' : position.replace(/\s+/g, '');
    return `${R2_PUBLIC_URL}/${safeCatno}_${safePosition}_cropped.jpg`;
  }
  
  // Handle "inside&back" position - keep it as is for the filename
  // The position should match exactly what's in R2: inside&back (not insideback)
  const safePosition = position === 'inside&back' ? 'inside&back' : position.replace(/\s+/g, '');
  
  // Files are at the root of the R2 public URL, no bucket name in path
  const url = `${R2_PUBLIC_URL}/${numericCatno}_${safePosition}_cropped.jpg`;
  
  // Console log for debugging
  console.log(`R2 URL generated - catno: "${catno}" -> numeric: "${numericCatno}", position: "${position}" -> "${safePosition}", URL: ${url}`);
  
  return url;
}

/**
 * Get all available cover positions for an album
 * Common positions: front, back, inside&back, 1, 2, 3, 4, 5, 6
 * 
 * Note: In production, you might want to query R2 to see which files actually exist
 * For now, we'll use a standard set of positions
 */
export function getStandardCoverPositions(): string[] {
  return ['front', 'back', 'inside&back', '1', '2', '3', '4', '5', '6'];
}

/**
 * Generate URLs for all standard cover positions
 * @param catno - Catalog number
 * @returns Array of image URLs (some may not exist, but that's handled by the image component)
 */
export function getAllAlbumCoverUrls(catno: string): string[] {
  return getStandardCoverPositions().map(position => 
    getAlbumCoverUrl(catno, position)
  );
}

/**
 * Get the front cover URL (most common)
 */
export function getFrontCoverUrl(catno: string): string {
  return getAlbumCoverUrl(catno, 'front');
}

