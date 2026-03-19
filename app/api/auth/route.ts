import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { makeSessionToken, SESSION_COOKIE } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// POST /api/auth — login or signup
export async function POST(req: NextRequest) {
  const { action, email, password, fullName } = await req.json();
  const sql = getDB();

  if (action === 'signup') {
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing.length > 0) return NextResponse.json({ error: 'Account already exists' }, { status: 409 });
    const hash = await bcrypt.hash(password, 10);
    const rows = await sql`INSERT INTO users (email, password_hash, full_name) VALUES (${email}, ${hash}, ${fullName || ''}) RETURNING id, email`;
    const user = rows[0];
    const token = makeSessionToken(user.id, user.email);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, fullName } });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === 'login') {
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    const rows = await sql`SELECT id, email, password_hash, full_name FROM users WHERE email = ${email}`;
    if (rows.length === 0) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    const token = makeSessionToken(user.id, user.email);
    const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, fullName: user.full_name } });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  }

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (action === 'me') {
    const { getSession } = await import('@/lib/auth');
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null });
    const rows = await sql`SELECT id, email, full_name FROM users WHERE id = ${session.userId}`;
    if (rows.length === 0) return NextResponse.json({ user: null });
    const u = rows[0];
    return NextResponse.json({ user: { id: u.id, email: u.email, fullName: u.full_name } });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
