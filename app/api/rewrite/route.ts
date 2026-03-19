import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { rewriteBullets } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { bullets, tone } = await req.json();
  if (!bullets?.length) return NextResponse.json({ error: 'Bullets required' }, { status: 400 });

  const rewritten = await rewriteBullets(bullets, tone || 'faang');
  return NextResponse.json({ ok: true, rewritten });
}
