import { httpGetJson, normalizeArticle } from '../utils.js';

const BASE = 'https://newsdata.io/api/1/news';

// Minimal implementation based on official docs and references:
// Auth via apikey query param. Endpoint supports keyword search and latest headlines.
export async function fetchNewsdata({ apiKey, q = '', language = 'en', country, category, page } = {}) {
  if (!apiKey) return [];
  const params = new URLSearchParams();
  params.set('apikey', apiKey);
  if (q) params.set('q', q);
  if (language) params.set('language', language);
  if (country) params.set('country', country);
  if (category) params.set('category', category);
  if (page) params.set('page', String(page));
  const url = `${BASE}?${params.toString()}`;
  const data = await httpGetJson(url);
  // Public docs example shows `articles`; some variants use `results`. Support both.
  const list = Array.isArray(data?.articles)
    ? data.articles
    : Array.isArray(data?.results)
    ? data.results
    : [];
  return list.map((a, idx) =>
    normalizeArticle({
      provider: 'newsdata.io',
      id: a?.id || a?.link || a?.url || String(idx),
      title: a?.title,
      description: a?.description || a?.content,
      url: a?.url || a?.link,
      imageUrl: a?.image_url || a?.image,
      publishedAt: a?.pubDate || a?.publishedAt || a?.pub_date,
      sourceName: a?.source?.name || a?.source_id,
      sourceUrl: a?.source?.url,
      author: a?.creator || a?.author || null,
      topic: q || null,
    })
  );
}
