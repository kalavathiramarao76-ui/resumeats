import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';
import { simulateRecruiter } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { resumeId, jdId } = await req.json();
  const sql = getDB();

  const resume = (await sql`SELECT data FROM resumes WHERE id = ${resumeId} AND user_id = ${session.userId}`)[0];
  if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

  let jdData;
  if (jdId) {
    const jd = (await sql`SELECT parsed_data FROM job_descriptions WHERE id = ${jdId} AND user_id = ${session.userId}`)[0];
    if (jd) jdData = JSON.parse(jd.parsed_data);
  }

  const result = await simulateRecruiter(JSON.parse(resume.data), jdData);
  return NextResponse.json({ ok: true, result });
}
