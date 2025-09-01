import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { fetchAllNews } from '../../../lib/news/fetchAll.js';
import { persistArticles } from '../../../lib/news/persist.js';
import { cookies } from 'next/headers';
import { verifySession, cookieName } from '../../../lib/admin/auth.js';

export const runtime = 'nodejs';

const DATA_DIR = path.join(process.cwd(), 'data', 'news');
const DATA_FILE = path.join(DATA_DIR, 'daily.json');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh');

    if (refresh === '1') {
      // Require admin session for refresh
      const token = cookies().get(cookieName)?.value;
      const valid = verifySession(token).valid;
      if (!valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const payload = await fetchAllNews({ sinceISO: since });
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      // Persist to Supabase (no-op if env not configured)
      try {
        await persistArticles(payload.items);
      } catch (persistErr) {
        console.warn('Persistence skipped/failed:', persistErr?.message || persistErr);
      }
      return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Serve cached daily file if available
    const buf = await fs.readFile(DATA_FILE, 'utf-8');
    const json = JSON.parse(buf);
    return NextResponse.json(json, { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } });
  } catch (e) {
    // Fallback: try fresh fetch if cache missing
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const payload = await fetchAllNews({ sinceISO: since });
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
      // Persist to Supabase (no-op if env not configured)
      try {
        await persistArticles(payload.items);
      } catch (persistErr) {
        console.warn('Persistence skipped/failed:', persistErr?.message || persistErr);
      }
      return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
      return NextResponse.json({ error: 'Failed to load news' }, { status: 500 });
    }
  }
}
