import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, cookieName } from '../../../lib/admin/auth.js';
import { buildClusters, summarizeCluster } from '../../../lib/news/cluster.js';
import { fetchRecentArticles, upsertClusterAndMembers, listClustersWithSamples } from '../../../lib/news/db.js';

export const runtime = 'nodejs';

async function computeClustersFromDB() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const rows = await fetchRecentArticles({ sinceISO: since, limit: 1000 });
  const items = rows.map((a) => ({
    id: a.id,
    title: a.title || '',
    description: a.description || '',
    url: a.url,
    imageUrl: a.image_url || null,
    publishedAt: a.published_at || null,
    provider: a.provider || null,
    sourceName: null,
  }));
  const rawClusters = buildClusters(items, { simThreshold: 0.28, maxClusters: 20 });
  const settled = await Promise.allSettled(rawClusters.map((c) => summarizeCluster(c)));
  const clusters = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') clusters.push(r.value);
  }
  // Persist clusters and memberships
  for (const c of clusters) {
    const articleIds = (c.articles || []).map((a) => a.id).filter(Boolean);
    await upsertClusterAndMembers({
      id: c.id,
      headline: c.headline,
      summary: c.summary,
      coverage: c.coverage,
      size: c.size,
      articleIds,
    });
  }
  return {
    generatedAt: new Date().toISOString(),
    count: clusters.length,
    clusters,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh');

    if (refresh === '1') {
      // Require admin session for refresh
      const token = cookies().get(cookieName)?.value;
      const { valid } = verifySession(token);
      if (!valid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const payload = await computeClustersFromDB();
      return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store' } });
    }

    // Default: read latest clusters from DB
    const list = await listClustersWithSamples({ limit: 20, sampleSize: 3 });
    return NextResponse.json({ generatedAt: new Date().toISOString(), count: list.length, clusters: list }, { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=3600' } });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to build clusters' }, { status: 500 });
  }
}
