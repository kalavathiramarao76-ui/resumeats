import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { optimizeFullResume } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { resumeId, jdText } = await req.json();
  const sql = getDB();

  const resume = (await sql`SELECT id, data, version FROM resumes WHERE id = ${resumeId} AND user_id = ${session.userId}`)[0];
  if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

  const optimized = await optimizeFullResume(JSON.parse(resume.data), jdText);
  if (!optimized) return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });

  // Save as new version
  const newVersion = (resume.version || 1) + 1;
  const rows = await sql`INSERT INTO resumes (user_id, title, data, version, parent_id, status) VALUES (${session.userId}, ${optimized.name || 'Optimized Resume'}, ${JSON.stringify(optimized)}, ${newVersion}, ${resume.id}, 'optimized') RETURNING id`;

  return NextResponse.json({ ok: true, resumeId: rows[0].id, data: optimized, version: newVersion });
}
