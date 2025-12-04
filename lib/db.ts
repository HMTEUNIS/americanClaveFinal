/**
 * Cloudflare D1 Database Helper
 * 
 * This file provides helper functions to query Cloudflare D1 database.
 * 
 * In Cloudflare Workers/Pages, you access D1 via the env.DB binding.
 * In Next.js API routes, you'll need to use the Cloudflare API or Workers.
 * 
 * For Next.js on Vercel, you'll typically:
 * 1. Create API routes that call Cloudflare Workers/Pages Functions
 * 2. Or use Cloudflare's REST API to query D1
 */

// Example: If using Cloudflare Workers/Pages Functions
// You would access D1 like this in a Worker:
// export default {
//   async fetch(request, env) {
//     const result = await env.DB.prepare("SELECT * FROM players").all();
//     return Response.json(result);
//   }
// }

// For Next.js, we'll create API routes that can be called from client components
// and server components can directly query if using Cloudflare Pages

export interface Player {
  id?: number;
  name: string; // Single name field (matches D1 schema)
  pictures?: string; // BLOB in DB, will be parsed to string array
  website?: string;
  role?: string; // From junction table when linked to albums
}

export interface Album {
  id?: number;
  title: string;
  track_list?: string; // BLOB in DB, will be parsed
  pictures?: string; // BLOB in DB, will be parsed
  credits?: string; // BLOB in DB, will be parsed
  path?: string;
  by?: string; // Artist/Producer
  catno?: string; // Catalog number - used for R2 image URLs
  dates?: string; // Recording and release dates (e.g., "recorded 1982-1994 - released 1995")
  tracklist?: Array<{ number: number; title: string; duration?: string }>;
  buyLink?: string;
  price?: number;
  availableForPurchase?: boolean;
  cloudflareWavUrl?: string;
}

/**
 * Example SQL queries you might use:
 * 
 * Players table structure (example):
 * CREATE TABLE players (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   firstName TEXT NOT NULL,
 *   lastName TEXT NOT NULL,
 *   instrument TEXT,
 *   slug TEXT UNIQUE
 * );
 * 
 * Albums table structure (example):
 * CREATE TABLE albums (
 *   id INTEGER PRIMARY KEY AUTOINCREMENT,
 *   title TEXT NOT NULL,
 *   year INTEGER,
 *   artist TEXT,
 *   slug TEXT UNIQUE,
 *   price REAL,
 *   availableForPurchase INTEGER DEFAULT 0,
 *   cloudflareWavUrl TEXT
 * );
 * 
 * Album-Player relationship (example):
 * CREATE TABLE album_players (
 *   album_id INTEGER,
 *   player_id INTEGER,
 *   FOREIGN KEY (album_id) REFERENCES albums(id),
 *   FOREIGN KEY (player_id) REFERENCES players(id)
 * );
 */

