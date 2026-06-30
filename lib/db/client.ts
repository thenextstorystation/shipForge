import { sql } from '@vercel/postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required environment variable: DATABASE_URL');
}

export { sql };
