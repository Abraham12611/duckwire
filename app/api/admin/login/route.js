import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signSession, cookieName, cookieMaxAge } from '../../../../lib/admin/auth.js';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const url = process.env.SUPABASE_URL;
    const anon = process.env.SUPABASE_ANON_KEY;
    if (!url || !anon) {
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const resp = await fetch(`${url}/rest/v1/rpc/verify_admin_login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anon,
        Authorization: `Bearer ${anon}`,
      },
      body: JSON.stringify({ p_username: username, p_password: password }),
      cache: 'no-store',
    });

    if (!resp.ok) {
      return NextResponse.json({ error: 'Auth check failed' }, { status: 401 });
    }

    const ok = await resp.json();
    if (ok !== true) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signSession(username);
    cookies().set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: cookieMaxAge,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
