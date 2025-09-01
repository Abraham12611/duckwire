// Persist fetched news into Supabase tables: sources and articles
// Uses service role key; ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.

import { getServiceRoleClient } from '../supabase/server.js';

function extractDomain(u) {
  try {
    const h = new URL(u).hostname.toLowerCase();
    return h.startsWith('www.') ? h.slice(4) : h;
  } catch {
    return null;
  }
}

async function getOrCreateSource(supabase, { sourceName, sourceUrl, articleUrl }) {
  const domain = extractDomain(sourceUrl) || extractDomain(articleUrl);
  const name = sourceName || (domain ? domain : null);

  // Try find by domain first
  if (domain) {
    const { data: foundByDomain, error: findErr } = await supabase
      .from('sources')
      .select('id, domain')
      .eq('domain', domain)
      .limit(1)
      .maybeSingle();
    if (!findErr && foundByDomain?.id) return foundByDomain.id;
  }

  // Fallback: try by name (exact)
  if (name) {
    const { data: foundByName } = await supabase
      .from('sources')
      .select('id, name')
      .eq('name', name)
      .limit(1)
      .maybeSingle();
    if (foundByName?.id) return foundByName.id;
  }

  // Create new source
  const { data: created, error: insertErr } = await supabase
    .from('sources')
    .insert({ name: name || 'Unknown', domain: domain || null, homepage_url: sourceUrl || null })
    .select('id')
    .single();
  if (insertErr) throw insertErr;
  return created.id;
}

export async function persistArticles(items = []) {
  if (!items?.length) return { inserted: 0, upserted: 0, total: 0 };
  // Graceful no-op if service role env not configured
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // eslint-disable-next-line no-console
    console.warn('persistArticles: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing; skipping DB write');
    return { inserted: 0, upserted: 0, total: items.length, skipped: true };
  }
  const supabase = getServiceRoleClient();

  // Resolve source_id for each item, then upsert articles by unique url
  const rows = [];
  for (const it of items) {
    try {
      const source_id = await getOrCreateSource(supabase, {
        sourceName: it.sourceName,
        sourceUrl: it.sourceUrl,
        articleUrl: it.url,
      });
      rows.push({
        source_id,
        url: it.url,
        title: it.title || null,
        description: it.description || null,
        author: it.author || null,
        image_url: it.imageUrl || null,
        published_at: it.publishedAt ? new Date(it.publishedAt).toISOString() : null,
        provider: it.provider || null,
        raw: it,
      });
    } catch (e) {
      // Skip problematic record
      // eslint-disable-next-line no-console
      console.warn('persistArticles: skip item due to source error', e?.message || e);
    }
  }

  let upserted = 0;
  // Batch upsert to reduce network calls (chunks of 500)
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from('articles')
      .upsert(chunk, { onConflict: 'url' })
      .select('id');
    if (error) throw error;
    upserted += data?.length || 0;
  }

  return { inserted: upserted, upserted, total: items.length };
}
