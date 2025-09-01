import { httpGetJson, normalizeArticle } from '../utils.js';

const BASE = 'https://gnews.io/api/v4';

export async function fetchGNews({ apiKey, q = '', max = 50, lang = 'en', country, sortBy } = {}) {
  if (!apiKey) return [];
  const endpoint = q ? 'search' : 'top-headlines';
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('lang', lang);
  if (country) params.set('country', country);
  if (sortBy) params.set('sortby', sortBy);
  params.set('max', String(Math.min(max, 100)));
  params.set('apikey', apiKey);
  const url = `${BASE}/${endpoint}?${params.toString()}`;
  const data = await httpGetJson(url);
  const items = Array.isArray(data?.articles) ? data.articles : [];
  return items.map((a, idx) =>
    normalizeArticle({
      provider: 'gnews.io',
      id: a?.id || a?.url || String(idx),
      title: a?.title,
      description: a?.description,
      url: a?.url,
      imageUrl: a?.image,
      publishedAt: a?.publishedAt,
      sourceName: a?.source?.name,
      sourceUrl: a?.source?.url,
      author: null,
      topic: q || null,
    })
  );
}
