import { NextResponse } from 'next/server';
import { getClusterDetail } from '../../../../lib/news/db.js';

export const runtime = 'nodejs';

export async function GET(_req, { params }) {
  try {
    const cluster = await getClusterDetail(params.slug);
    if (!cluster) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ cluster });
  } catch (e) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
