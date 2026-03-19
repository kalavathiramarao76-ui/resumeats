import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { parseResume } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { text, title } = await req.json();
  if (!text) return NextResponse.json({ error: 'Resume text required' }, { status: 400 });

  const parsed = await parseResume(text);
  if (!parsed) return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });

  const sql = getDB();
  const rows = await sql`INSERT INTO resumes (user_id, title, data, status) VALUES (${session.userId}, ${title || parsed.name || 'Untitled Resume'}, ${JSON.stringify(parsed)}, 'parsed') RETURNING id`;

  return NextResponse.json({ ok: true, resumeId: rows[0].id, data: parsed });
}
