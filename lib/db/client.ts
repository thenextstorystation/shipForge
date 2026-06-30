// Server-only. Never import this in a "use client" file or any component.
import { sql } from '@vercel/postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

// @vercel/postgres reads DATABASE_URL automatically.
// Re-export sql as the single query interface for the entire application.
export { sql };
