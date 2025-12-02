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

