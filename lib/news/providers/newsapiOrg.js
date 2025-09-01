import { httpGetJson, normalizeArticle } from '../utils.js';

const BASE = 'https://newsapi.org/v2';

export async function fetchNewsapiOrg({ apiKey, q = '', from, to, pageSize = 50, language = 'en' } = {}) {
  if (!apiKey) return [];
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  params.set('language', language);
  params.set('pageSize', String(Math.min(pageSize, 100)));
  const url = `${BASE}/everything?${params.toString()}`;
  const data = await httpGetJson(url, { headers: { 'X-Api-Key': apiKey } });
  const items = Array.isArray(data?.articles) ? data.articles : [];
  return items.map((a, idx) =>
    normalizeArticle({
      provider: 'newsapi.org',
      id: a?.url || String(idx),
      title: a?.title,
      description: a?.description,
      url: a?.url,
      imageUrl: a?.urlToImage,
      publishedAt: a?.publishedAt,
      sourceName: a?.source?.name,
      sourceUrl: undefined,
      author: a?.author,
      topic: q || null,
    })
  );
}
