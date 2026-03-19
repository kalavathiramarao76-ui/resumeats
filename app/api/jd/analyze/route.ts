import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { analyzeJD } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { text, title, company } = await req.json();
  if (!text) return NextResponse.json({ error: 'Job description text required' }, { status: 400 });

  const parsed = await analyzeJD(text);
  if (!parsed) return NextResponse.json({ error: 'Failed to analyze JD' }, { status: 500 });

  const sql = getDB();
  const rows = await sql`INSERT INTO job_descriptions (user_id, title, company, raw_text, parsed_data) VALUES (${session.userId}, ${title || parsed.title || 'Untitled'}, ${company || parsed.company || ''}, ${text}, ${JSON.stringify(parsed)}) RETURNING id`;

  return NextResponse.json({ ok: true, jdId: rows[0].id, data: parsed });
}
