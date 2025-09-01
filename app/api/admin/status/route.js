import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, cookieName } from '../../../../lib/admin/auth.js';

export const runtime = 'nodejs';

export async function GET() {
  const token = cookies().get(cookieName)?.value;
  const result = verifySession(token);
  return NextResponse.json({ authenticated: !!result.valid, username: result.username || null });
}
