# Cloudflare D1 Integration Guide

This guide explains where and how to integrate Cloudflare D1 database queries into your Next.js application.

## Overview

Your application has two types of components:
1. **Client Components** (`'use client'`) - Need to fetch data via API routes
2. **Server Components** (default) - Can directly query D1 or use API routes

## Integration Points

### 1. Players Page (`/app/players/page.tsx`)

**Current:** Client component with `dummyPlayers` array (line 50-62)

**To Integrate:**
```typescript
// Replace the dummyPlayers array with a fetch call
const [players, setPlayers] = useState<Player[]>([]);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function fetchPlayers() {
    const response = await fetch('/api/players');
    const data = await response.json();
    setPlayers(data);
    setIsLoading(false);
  }
  fetchPlayers();
}, []);
```

**Then update:** Replace `dummyPlayers` with `players` in the filtering/sorting logic.

---

### 2. Player Profile Page (`/app/players/[playername]/page.tsx`)

**Current:** Server component with `dummyPlayers` array (line 13-84)

**To Integrate:**
```typescript
// Option A: Direct D1 query (if using Cloudflare Pages)
import { getRequestContext } from '@cloudflare/next-on-pages';

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { playername } = await params;
  
  // Direct D1 access (Cloudflare Pages only)
  const env = getRequestContext().env;
  const player = await env.DB.prepare(
    'SELECT * FROM players WHERE slug = ?'
  ).bind(playername).first();
  
  if (!player) {
    notFound();
  }
  
  // Fetch related data (albums, images)
  const albums = await env.DB.prepare(
    'SELECT a.* FROM albums a INNER JOIN album_players ap ON a.id = ap.album_id WHERE ap.player_id = ?'
  ).bind(player.id).all();
  
  // ... rest of component
}

// Option B: Use API route (works everywhere)
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/players/${playername}`);
const player = await response.json();
```

---

### 3. Music Page (`/app/music/page.tsx`)

**Current:** Client component with `dummyAlbums` array (line 13-24)

**To Integrate:**
```typescript
const [albums, setAlbums] = useState<Album[]>([]);

useEffect(() => {
  async function fetchAlbums() {
    const response = await fetch('/api/albums');
    const data = await response.json();
    setAlbums(data);
  }
  fetchAlbums();
}, []);
```

---

### 4. Album Detail Page (`/app/music/[albumname]/page.tsx`)

**Current:** Server component with `dummyAlbums` array (line 30-180)

**To Integrate:**
```typescript
// Similar to player profile - use direct D1 query or API route
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums/${albumname}`);
const album = await response.json();
```

---

### 5. Purchase Page (`/app/purchase/page.tsx`)

**Current:** Client component with `purchasableAlbums` array (line 18-58)

**To Integrate:**
```typescript
// Fetch only albums available for purchase
const response = await fetch('/api/albums?purchasable=true');
const albums = await response.json();
```

---

## Setting Up Cloudflare D1

### 1. Create D1 Database

```bash
# Install Wrangler CLI
npm install -g wrangler

# Create a D1 database
wrangler d1 create american-clave-db

# This will give you a database_id - save it!
```

### 2. Create Database Schema

Create a migration file or run SQL directly:

```sql
-- Players table
CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  instrument TEXT,
  slug TEXT UNIQUE,
  images TEXT -- JSON array of image URLs
);

-- Albums table
CREATE TABLE albums (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  year INTEGER,
  artist TEXT,
  slug TEXT UNIQUE,
  albumArt TEXT, -- JSON array of image URLs
  price REAL,
  availableForPurchase INTEGER DEFAULT 0,
  cloudflareWavUrl TEXT,
  buyLink TEXT
);

-- Tracks table
CREATE TABLE tracks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  album_id INTEGER,
  number INTEGER,
  title TEXT NOT NULL,
  duration TEXT,
  FOREIGN KEY (album_id) REFERENCES albums(id)
);

-- Album-Player relationship
CREATE TABLE album_players (
  album_id INTEGER,
  player_id INTEGER,
  FOREIGN KEY (album_id) REFERENCES albums(id),
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

### 3. Configure Environment Variables

Add to `.env.local`:
```
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_D1_DATABASE_ID=your_database_id
```

### 4. Update API Routes

The API routes in `/app/api/players/route.ts` and `/app/api/albums/route.ts` have TODO comments showing where to add your D1 queries.

## Next Steps

1. Set up your Cloudflare D1 database
2. Create your database schema
3. Populate with data
4. Update the API routes with actual D1 queries
5. Replace dummy data in components with API calls
6. Test thoroughly!

## Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Cloudflare D1 REST API](https://developers.cloudflare.com/api/operations/cloudflare-d1-query-database)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)

