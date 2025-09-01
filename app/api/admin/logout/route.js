import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { cookieName } from '../../../../lib/admin/auth.js';

export const runtime = 'nodejs';

export async function POST() {
  try {
    cookies().delete(cookieName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
