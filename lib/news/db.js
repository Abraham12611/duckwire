import { getAnonClient, getServiceRoleClient } from '../supabase/server.js';

export async function fetchRecentArticles({ sinceISO, limit = 500 }) {
  // Use service role for reliable server-side reads during pipeline/SSR
  const supabase = getServiceRoleClient();
  let q = supabase.from('articles').select('*').order('published_at', { ascending: false }).limit(limit);
  if (sinceISO) q = q.gte('published_at', sinceISO);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function upsertClusterAndMembers({ id, headline, summary, coverage, size, articleIds }) {
  const supabase = getServiceRoleClient();
  // Upsert cluster row
  const clusterRow = {
    id,
    headline,
    summary_left: summary?.left || [],
    summary_center: summary?.center || [],
    summary_right: summary?.right || [],
    coverage_left: coverage?.left ?? 0,
    coverage_center: coverage?.center ?? 0,
    coverage_right: coverage?.right ?? 0,
    size: size ?? articleIds.length,
    generated_at: new Date().toISOString(),
  };
  const { error: upsertErr } = await supabase.from('clusters').upsert(clusterRow, { onConflict: 'id' });
  if (upsertErr) throw upsertErr;

  // Replace membership
  const { error: delErr } = await supabase.from('cluster_articles').delete().eq('cluster_id', id);
  if (delErr) throw delErr;
  if (articleIds.length) {
    const rows = articleIds.map((aid, idx) => ({ cluster_id: id, article_id: aid, position: idx }));
    const { error: insErr } = await supabase.from('cluster_articles').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function listClustersWithSamples({ limit = 20, sampleSize = 3 }) {
  // Use service role on server to avoid any RLS edge cases when composing data
  const supabase = getServiceRoleClient();
  const { data: clusters, error } = await supabase
    .from('clusters')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  // For each cluster, fetch a few articles
  const result = [];
  for (const c of clusters || []) {
    const { data: links } = await supabase
      .from('cluster_articles')
      .select('article_id, position')
      .eq('cluster_id', c.id)
      .order('position', { ascending: true })
      .limit(sampleSize);
    const articleIds = (links || []).map((l) => l.article_id);
    let articles = [];
    if (articleIds.length) {
      const { data: arts } = await supabase
        .from('articles')
        .select('id, title, url, image_url, published_at, provider, source_id')
        .in('id', articleIds);
      articles = arts || [];
    }
    result.push(toClusterPayload(c, articles));
  }
  return result;
}

export async function getClusterDetail(clusterId) {
  const supabase = getServiceRoleClient();
  const { data: c, error } = await supabase.from('clusters').select('*').eq('id', clusterId).maybeSingle();
  if (error || !c) return null;
  const { data: links } = await supabase
    .from('cluster_articles')
    .select('article_id, position')
    .eq('cluster_id', clusterId)
    .order('position', { ascending: true });
  const articleIds = (links || []).map((l) => l.article_id);
  let articles = [];
  if (articleIds.length) {
    const { data: arts } = await supabase
      .from('articles')
      .select('id, title, url, description, image_url, published_at, provider, source_id')
      .in('id', articleIds);
    articles = (arts || []).sort((a, b) => articleIds.indexOf(a.id) - articleIds.indexOf(b.id));
  }
  return toClusterPayload(c, articles);
}

function toClusterPayload(c, articles) {
  const summary = {
    left: safeJsonArray(c.summary_left),
    center: safeJsonArray(c.summary_center),
    right: safeJsonArray(c.summary_right),
  };
  const coverage = { left: c.coverage_left || 0, center: c.coverage_center || 0, right: c.coverage_right || 0 };
  const mappedArticles = (articles || []).map((a) => ({
    id: a.id,
    title: a.title,
    url: a.url,
    description: a.description || null,
    imageUrl: a.image_url,
    publishedAt: a.published_at,
    provider: a.provider,
  }));
  return {
    id: c.id,
    headline: c.headline,
    size: c.size,
    summary,
    coverage,
    sources: { left: [], center: [], right: [] },
    articles: mappedArticles,
    generatedAt: c.generated_at,
  };
}

function safeJsonArray(v) {
  try {
    const arr = typeof v === 'string' ? JSON.parse(v) : v;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
