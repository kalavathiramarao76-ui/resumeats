import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET /api/resumes — list user's resumes
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const sql = getDB();
  const rows = await sql`SELECT id, title, created_at, updated_at FROM resumes WHERE user_id = ${session.userId} ORDER BY updated_at DESC`;
  return NextResponse.json({ resumes: rows });
}

// POST /api/resumes — save a resume
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  const { id, title, data } = await req.json();
  const sql = getDB();

  if (id) {
    // Update existing
    await sql`UPDATE resumes SET title = ${title}, data = ${JSON.stringify(data)}, updated_at = NOW() WHERE id = ${id} AND user_id = ${session.userId}`;
    return NextResponse.json({ ok: true, id });
  } else {
    // Create new
    const rows = await sql`INSERT INTO resumes (user_id, title, data) VALUES (${session.userId}, ${title}, ${JSON.stringify(data)}) RETURNING id`;
    return NextResponse.json({ ok: true, id: rows[0].id });
  }
}
