/**
 * Generates a URL-friendly slug from a player's name (single string)
 * Removes punctuation and converts to lowercase with hyphens
 */
export function generatePlayerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Finds a player by slug from the player list
 */
export function findPlayerBySlug(
  players: Array<{ name: string }>,
  slug: string
): { name: string } | undefined {
  return players.find(player => {
    const playerSlug = generatePlayerSlug(player.name);
    return playerSlug === slug;
  });
}

/**
 * Generates a URL-friendly slug from an album title
 * Removes punctuation and converts to lowercase with hyphens
 */
export function generateAlbumSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove punctuation
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Maps a player name to their image file path in /playerpics/
 * Converts names like "Alfredo Triff" to "alfredo_triff.png"
 * Handles special cases like "Charles Neville" -> "charlie_neville.png"
 */
export function getPlayerImagePath(name: string): string | null {
  // Special name mappings
  const nameMappings: Record<string, string> = {
    'charles neville': 'charlie_neville',
    '"puntilla" orlando rios': 'orlando_rios',
    'orlando rios': 'orlando_rios',
    'horacio "el negro" hernandez': 'horacio_el_negro_hernandez',
  };

  // Normalize: lowercase, trim, and remove all types of quotes
  const normalizedName = name
    .toLowerCase()
    .replace(/["'"]/g, '') // Remove all types of quotes
    .trim();
  
  // Check for special mappings first
  if (nameMappings[normalizedName]) {
    return `/playerpics/${nameMappings[normalizedName]}.png`;
  }

  // Convert name to file format: remove special chars, replace spaces with underscores
  const fileBase = normalizedName
    .replace(/[^\w\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();

  return `/playerpics/${fileBase}.png`;
}

