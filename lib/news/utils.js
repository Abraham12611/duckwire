// Shared HTTP utilities for server-side news fetching
// Node 18+ has global fetch. These helpers implement basic retry with backoff for 429/503.

export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function httpGetJson(url, { headers = {}, signal } = {}, retries = 2, backoffMs = 800) {
  const resp = await fetch(url, { headers, signal });
  if (!resp.ok) {
    const isRetryable = resp.status === 429 || resp.status === 503;
    let bodyText = '';
    try { bodyText = await resp.text(); } catch {}
    if (isRetryable && retries > 0) {
      await sleep(backoffMs);
      return httpGetJson(url, { headers, signal }, retries - 1, Math.min(backoffMs * 2, 8000));
    }
    const err = new Error(`HTTP ${resp.status} ${resp.statusText} for ${url} ${bodyText ? '- ' + bodyText.slice(0, 300) : ''}`);
    err.status = resp.status;
    err.body = bodyText;
    throw err;
  }
  return resp.json();
}

export function dedupeArticles(articles) {
  const seen = new Set();
  const out = [];
  for (const a of articles) {
    const key = a.url || a.title || JSON.stringify(a);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

export function toISODate(input) {
  if (!input) return null;
  try {
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

export function normalizeArticle({
  provider,
  id,
  title,
  description,
  url,
  imageUrl,
  publishedAt,
  sourceName,
  sourceUrl,
  author,
  topic,
}) {
  return {
    provider,
    id: id || undefined,
    title: title || '',
    description: description || '',
    url: url || '',
    imageUrl: imageUrl || null,
    publishedAt: toISODate(publishedAt),
    sourceName: sourceName || null,
    sourceUrl: sourceUrl || null,
    author: author || null,
    topic: topic || null,
  };
}
