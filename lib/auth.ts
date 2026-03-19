import { cookies } from 'next/headers';
import { getDB } from './db';

const SESSION_COOKIE = 'resumeats_session';

export async function getSession(): Promise<{ userId: number; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    // Token is base64(userId:email:timestamp)
    const decoded = Buffer.from(token, 'base64').toString();
    const [userId, email] = decoded.split(':');
    if (!userId || !email) return null;

    // Verify user exists
    const sql = getDB();
    const rows = await sql`SELECT id, email FROM users WHERE id = ${parseInt(userId)} AND email = ${email}`;
    if (rows.length === 0) return null;

    return { userId: parseInt(userId), email };
  } catch {
    return null;
  }
}

export function makeSessionToken(userId: number, email: string): string {
  return Buffer.from(`${userId}:${email}:${Date.now()}`).toString('base64');
}

export { SESSION_COOKIE };
