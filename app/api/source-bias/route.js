import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import path from 'path';
import fs from 'fs/promises';
import { cookieName, verifySession } from '../../../lib/admin/auth.js';

function dataFilePath() {
  return path.join(process.cwd(), 'data', 'source-bias.json');
}

async function readMap() {
  try {
    const p = dataFilePath();
    const buf = await fs.readFile(p, 'utf8');
    const json = JSON.parse(buf || '{}');
    return json.map || {};
  } catch (e) {
    return {};
  }
}

async function writeMap(map) {
  const p = dataFilePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify({ map }, null, 2), 'utf8');
}

export async function GET() {
  const map = await readMap();
  return NextResponse.json({ map });
}

export async function POST(req) {
  try {
    // Authz: require admin session
    const jar = cookies();
    const token = jar.get(cookieName)?.value;
    const v = verifySession(token);
    if (!v?.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const provider = (body?.provider || '').trim();
    const bias = String(body?.bias || '').toLowerCase();
    if (!provider) return NextResponse.json({ error: 'Missing provider' }, { status: 400 });
    if (!['left', 'center', 'right'].includes(bias)) {
      return NextResponse.json({ error: 'Invalid bias' }, { status: 400 });
    }

    const map = await readMap();
    map[provider] = bias;
    await writeMap(map);
    return NextResponse.json({ ok: true, map });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
