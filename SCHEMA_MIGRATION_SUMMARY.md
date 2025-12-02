# Schema Migration Summary

This document summarizes the changes made to align the codebase with your Cloudflare D1 database schema.

## Key Changes

### 1. Player Schema Update
**Changed from:** `firstName` and `lastName` (two separate fields)  
**Changed to:** `name` (single string field)

**Files Updated:**
- `lib/db.ts` - Updated Player interface
- `lib/utils.ts` - Updated `generatePlayerSlug()` to accept single name
- `components/PlayerCard.tsx` - Now accepts `name` and `role` props
- `app/players/page.tsx` - Updated to use single name field, search works on full name
- `app/players/[playername]/page.tsx` - Updated player profile page
- `app/music/[albumname]/page.tsx` - Updated player references in albums

**Core Players List:**
Updated to use single name strings:
- 'Alfredo Triff'
- 'Andy Gonzalez'
- 'Astor Piazzolla'
- etc.

### 2. Album Schema Update
**Added:** `catno` (catalog number) field to Album interface

**Files Updated:**
- `lib/db.ts` - Updated Album interface to match D1 schema
- `lib/r2-images.ts` - **NEW FILE** - Helper functions for R2 image URLs
- `components/AlbumCard.tsx` - Now displays album covers from R2 using catno
- `app/music/page.tsx` - Added catno to dummy albums
- `app/music/[albumname]/page.tsx` - Uses catno to generate R2 image URLs for carousel

### 3. R2 Image Integration

**R2 Bucket:** `covers`  
**Naming Convention:** `{catno}_{position}_cropped.jpg`

**Positions Supported:**
- `front` - Front cover
- `back` - Back cover
- `inside&back` - Inside and back
- `1`, `2`, `3`, `4`, etc. - Booklet pages

**Helper Functions (lib/r2-images.ts):**
- `getAlbumCoverUrl(catno, position)` - Get URL for specific position
- `getFrontCoverUrl(catno)` - Get front cover URL
- `getAllAlbumCoverUrls(catno)` - Get all standard cover positions

**Usage:**
```typescript
import { getFrontCoverUrl, getAllAlbumCoverUrls } from '@/lib/r2-images';

// On album card
const frontCover = getFrontCoverUrl(album.catno);

// On album detail page carousel
const allCovers = getAllAlbumCoverUrls(album.catno);
```

### 4. Environment Variables Needed

Add to `.env.local`:
```
NEXT_PUBLIC_R2_PUBLIC_URL=https://your-r2-bucket.r2.cloudflarestorage.com
```

Or if using Cloudflare R2 public domain:
```
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

## Database Schema Reference

### Players Table
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT) - Single name field
- `pictures` (BLOB) - Will be parsed to string array
- `website` (TEXT)

### Albums Table (called "Players" in your DB - note the naming)
- `id` (INTEGER, PRIMARY KEY)
- `title` (TEXT)
- `track_list` (BLOB) - Will be parsed
- `pictures` (BLOB) - Will be parsed
- `credits` (BLOB) - Will be parsed
- `path` (TEXT)
- `by` (TEXT) - Artist/Producer
- `catno` (TEXT) - **Catalog number for R2 images**

### Songs Table
- `id` (INTEGER, PRIMARY KEY)
- `position` (TEXT)
- `title` (TEXT)
- `album_id` (INTEGER)

### Junction Table (Players linked to Albums through Songs)
- `id` (INTEGER, PRIMARY KEY)
- `player_id` (INTEGER)
- `album_id` (INTEGER)
- `song_name` (TEXT)
- `role` (TEXT) - Instrument/role
- `created_at` (TIMESTAMP)

## Next Steps

1. **Set R2 Public URL** - Update `NEXT_PUBLIC_R2_PUBLIC_URL` in environment variables
2. **Convert PDFs to JPGs** - As mentioned, convert all PDFs in R2 to JPG format
3. **Update API Routes** - Replace dummy data with actual D1 queries in:
   - `/app/api/players/route.ts`
   - `/app/api/albums/route.ts`
   - `/app/api/albums/[slug]/route.ts`
4. **Test Image Loading** - Verify R2 images load correctly with the catno-based URLs

## Notes

- The carousel will attempt to load all standard positions. Images that don't exist will fail gracefully (hidden via onError handler)
- Player search now works on the full name string instead of separate first/last name fields
- Core players are still prioritized first, then sorted alphabetically by full name

