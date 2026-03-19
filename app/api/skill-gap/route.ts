import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { generateSkillGap } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { resumeId, jdId } = await req.json();
  const sql = getDB();

  const resume = (await sql`SELECT data FROM resumes WHERE id = ${resumeId} AND user_id = ${session.userId}`)[0];
  const jd = (await sql`SELECT parsed_data FROM job_descriptions WHERE id = ${jdId} AND user_id = ${session.userId}`)[0];
  if (!resume || !jd) return NextResponse.json({ error: 'Resume or JD not found' }, { status: 404 });

  const result = await generateSkillGap(JSON.parse(resume.data), JSON.parse(jd.parsed_data));
  return NextResponse.json({ ok: true, result });
}
