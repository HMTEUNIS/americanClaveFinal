/**
 * Album grouping configuration
 * Matches albums to their designated groups based on title and artist
 */

export interface AlbumGroup {
  id: number;
  name: string;
  albums: Array<{
    artist: string;
    title: string;
  }>;
}

export const albumGroups: AlbumGroup[] = [
  {
    id: 1,
    name: 'Group 1',
    albums: [
      { artist: 'JERRY GONZALEZ', title: 'YA YO ME CURÀ' },
      { artist: 'TEO MACERO', title: 'TEO' },
      { artist: 'MILTON CARDONA', title: 'BEMBE' },
      { artist: 'MILTON CARDONA', title: 'CAMBUCHA (CARMEN)' },
    ],
  },
  {
    id: 2,
    name: 'Group 2',
    albums: [
      { artist: 'KIP HANRAHAN', title: 'DRAWN FROM MEMORY (GREATEST HITS, OR WHATEVER... KIP ON CAMPUS)' },
      { artist: 'KIP HANRAHAN', title: 'BEAUTIFUL SCARS' },
      { artist: 'KIP HANRAHAN', title: 'AT HOME IN ANGER, which could also be called IMPERFECT, Happily' },
    ],
  },
  {
    id: 3,
    name: 'Group 3',
    albums: [
      { artist: 'KIP HANRAHAN', title: 'coup de tete' },
      { artist: 'KIP HANRAHAN', title: 'DESIRE DEVELOPS AN EDGE' },
      { artist: 'KIP HANRAHAN', title: "VERTICAL'S CURRENCY" },
    ],
  },
  {
    id: 4,
    name: 'Group 4',
    albums: [
      { artist: 'KIP HANRAHAN', title: 'A THOUSAND NIGHTS AND A NIGHT (1-RED NIGHTS)' },
      { artist: 'KIP HANRAHAN', title: 'A THOUSAND NIGHTS AND A NIGHT (SHADOW NIGHTS -1)' },
      { artist: 'KIP HANRAHAN', title: 'A THOUSAND NIGHTS AND A NIGHT (SHADOW NIGHTS 2)' },
    ],
  },
  {
    id: 5,
    name: 'Group 5',
    albums: [
      { artist: 'KIP HANRAHAN', title: 'A FEW SHORT NOTES FOR THE END RUN' },
      { artist: 'KIP HANRAHAN', title: 'DAYS AND NIGHTS OF BLUE LUCK INVERTED' },
      { artist: 'KIP HANRAHAN', title: 'TENDERNESS' },
      { artist: 'KIP HANRAHAN', title: 'EXOTICA' },
      { artist: 'KIP HANRAHAN', title: 'ALL ROADS ARE MADE OF THE FLESH' },
    ],
  },
  {
    id: 6,
    name: 'Group 6',
    albums: [
      { artist: 'KIP HANRAHAN', title: 'original music from the soundtrack to PINERO' },
    ],
  },
  {
    id: 7,
    name: 'Group 7',
    albums: [
      { artist: 'ASTOR PIAZZOLLA', title: 'TANGO: ZERO HOUR' },
      { artist: 'ASTOR PIAZZOLLA', title: 'THE ROUGH DANCER AND THE CYCLICAL NIGHT (Tango Apasionado)' },
      { artist: 'ASTOR PIAZZOLLA', title: 'LA CAMORRA: THE SOLITUDE OF PASSIONATE PROVOCATION' },
      { artist: 'SILVANA DELUIGI', title: 'YO!' },
    ],
  },
  {
    id: 8,
    name: 'Group 8',
    albums: [
      { artist: 'PAUL HAINES', title: 'DARN IT!' },
      { artist: 'PIRI THOMAS', title: 'EVERY CHILD IS BORN A POET' },
    ],
  },
  {
    id: 9,
    name: 'Group 9',
    albums: [
      { artist: 'ALFREDO TRIFF', title: '21 BROKEN MELODIES AT ONCE' },
      { artist: 'DEEP RUMBA', title: 'THIS NIGHT BECOMES A RUMBA' },
      { artist: 'DEEP RUMBA', title: 'A CALM IN THE FIRE OF DANCES' },
      { artist: 'RUMBA PROFUNDA', title: 'ALTA EN LA FIEBRE DE LA RUMBA' },
      { artist: 'HORACIO EL NEGRO HERNANDEZ AND ROBBY AMEEN', title: 'ROBBY & NEGRO AT THE THIRD WORLD WAR' },
      { artist: 'CONJURE', title: 'MUSIC FOR THE TEXTS OF ISHMAEL REED' },
      { artist: 'CONJURE', title: 'CAB CALLOWAY STANDS IN FOR THE MOON' },
      { artist: 'CONJURE', title: 'BAD MOUTH' },
    ],
  },
  {
    id: 10,
    name: 'Group 10',
    albums: [
      { artist: 'DNA', title: 'A TASTE OF DNA' },
      { artist: 'DNA', title: 'I WAS BORN, BUT...' },
      { artist: 'AMERICAN CLAVE', title: 'ANTHOLOGY' },
    ],
  },
  {
    id: 11,
    name: 'Group 11',
    albums: [
      { artist: 'DZIGA VERTOV', title: 'ENTHUSIASM!' },
    ],
  },
];

/**
 * Normalize strings for matching (remove extra spaces, convert to uppercase, etc.)
 */
function normalizeString(str: string): string {
  return str
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, ''); // Remove punctuation for more flexible matching
}

/**
 * Check if an album matches a group album entry
 */
function albumMatches(album: { title: string; artist?: string; by?: string }, groupAlbum: { artist: string; title: string }): boolean {
  const albumArtist = normalizeString(album.artist || album.by || '');
  const albumTitle = normalizeString(album.title);
  const groupArtist = normalizeString(groupAlbum.artist);
  const groupTitle = normalizeString(groupAlbum.title);

  // Try exact match first
  if (albumArtist === groupArtist && albumTitle === groupTitle) {
    return true;
  }

  // Try partial match (in case of slight variations)
  const artistMatch = albumArtist.includes(groupArtist) || groupArtist.includes(albumArtist);
  const titleMatch = albumTitle.includes(groupTitle) || groupTitle.includes(albumTitle);

  return artistMatch && titleMatch;
}

/**
 * Assign albums to groups
 */
export function assignAlbumsToGroups(albums: Array<{ id: number; title: string; artist?: string; by?: string }>): Map<number, Array<any>> {
  const grouped = new Map<number, Array<any>>();
  const ungrouped: Array<any> = [];

  // Initialize groups
  albumGroups.forEach(group => {
    grouped.set(group.id, []);
  });

  // Assign albums to groups
  albums.forEach(album => {
    let assigned = false;
    for (const group of albumGroups) {
      for (const groupAlbum of group.albums) {
        if (albumMatches(album, groupAlbum)) {
          grouped.get(group.id)?.push(album);
          assigned = true;
          break;
        }
      }
      if (assigned) break;
    }
    if (!assigned) {
      ungrouped.push(album);
    }
  });

  // Add ungrouped albums to a special group
  if (ungrouped.length > 0) {
    grouped.set(0, ungrouped);
  }

  return grouped;
}

