import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';

export function getDB() {
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set');
  return neon(DATABASE_URL);
}
