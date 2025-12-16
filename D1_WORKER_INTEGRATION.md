# D1 Worker Integration

Your Next.js application is now wired up to fetch data from your Cloudflare D1 database via the worker at:
**https://d1-worker.americanclaveuser.workers.dev/**

## Worker Endpoints Required

Your D1 worker should implement the following endpoints:

### 1. `GET /players`
Returns all players from the Players table.

**Expected Response:**
```json 
[
  {
    "id": 1,
    "name": "Kip Hanrahan",
    "pictures": "[\"url1\", \"url2\"]", // JSON string (BLOB)
    "website": "https://..."
  },
  ...
]
```

### 2. `GET /players/:slug`
Returns a single player by slug (generated from name).

**Expected Response:**
```json
{
  "id": 1,
  "name": "Kip Hanrahan",
  "pictures": "[\"url1\", \"url2\"]",
  "website": "https://...",
  "albums": ["Album 1", "Album 2"] // Optional: albums this player is on
}
```

### 3. `GET /albums`
Returns all albums from the Albums table.

**Expected Response:**
```json
[
  {
    "id": 1,
    "title": "Desire Develops an Edge",
    "year": 1983,
    "by": "Kip Hanrahan",
    "catno": "1014",
    "availableForPurchase": true,
    "price": 15.99,
    "cloudflareWavUrl": "https://..."
  },
  ...
]
```

**Query Parameters:**
- `?purchasable=true` - Filter to only albums with `availableForPurchase: true`

### 4. `GET /albums/:slug`
Returns a single album by slug (generated from title) with related data.

**Expected Response:**
```json
{
  "id": 1,
  "title": "Desire Develops an Edge",
  "year": 1983,
  "by": "Kip Hanrahan",
  "catno": "1014",
  "tracklist": [
    {
      "number": 1,
      "title": "Track One",
      "duration": "5:30"
    },
    ...
  ],
  "players": [
    {
      "name": "Kip Hanrahan",
      "role": "Producer"
    },
    ...
  ],
  "availableForPurchase": true,
  "price": 15.99,
  "cloudflareWavUrl": "https://...",
  "buyLink": "https://..."
}
```

## Data Flow

### Client Components (use API routes)
1. **Players Page** (`/app/players/page.tsx`)
   - Fetches from `/api/players`
   - API route calls D1 worker at `/players`

2. **Music Page** (`/app/music/page.tsx`)
   - Fetches from `/api/albums`
   - API route calls D1 worker at `/albums`

3. **Purchase Page** (`/app/purchase/page.tsx`)
   - Fetches from `/api/albums?purchasable=true`
   - API route calls D1 worker at `/albums?purchasable=true`

### Server Components (call worker directly)
1. **Album Detail Page** (`/app/music/[albumname]/page.tsx`)
   - Calls `fetchAlbumBySlug()` from `lib/d1-worker.ts`
   - Which calls D1 worker at `/albums/:slug`

2. **Player Detail Page** (`/app/players/[playername]/page.tsx`)
   - Calls `fetchPlayerBySlug()` from `lib/d1-worker.ts`
   - Which calls D1 worker at `/players/:slug`

## Helper Functions

All D1 worker calls go through `lib/d1-worker.ts`:
- `fetchPlayers()` - GET /players
- `fetchAlbums()` - GET /albums
- `fetchAlbumBySlug(slug)` - GET /albums/:slug
- `fetchPlayerBySlug(slug)` - GET /players/:slug

## Data Transformations

The code handles:
- **BLOB fields**: Parses JSON strings from `pictures` and `track_list` fields
- **Player names**: Uses single `name` field (not firstName/lastName)
- **Album catalog numbers**: Uses `catno` to generate R2 image URLs
- **Artist field**: Handles both `artist` and `by` fields from DB

## R2 Image URLs

Album covers are automatically generated using the `catno` field:
- Format: `https://pub-2e173b57501f46d1b35ca8b2b67e30e6.r2.dev/{catno}_{position}_cropped.jpg`
- Positions: `front`, `back`, `inside&back`, `1`, `2`, `3`, etc.

## Testing

To test the integration:
1. Make sure your D1 worker is running at the specified URL
2. Check browser console for any fetch errors
3. Verify data is loading on:
   - `/players` page
   - `/music` page
   - `/purchase` page
   - Individual album/player pages

## Environment Variables

Optional (defaults are set):
- `D1_WORKER_URL` - Override the worker URL (defaults to your URL)
- `NEXT_PUBLIC_R2_PUBLIC_URL` - Override R2 public URL

