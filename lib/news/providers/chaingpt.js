import { httpGetJson, normalizeArticle } from '../utils.js';

const BASE = 'https://api.chaingpt.org/v1/news';

export async function fetchChaingpt({ apiKey, query = '', limit = 50, fetchAfter } = {}) {
  if (!apiKey) return [];
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (limit) params.set('limit', String(Math.min(limit, 100)));
  if (fetchAfter) params.set('fetchAfter', fetchAfter);
  const url = `${BASE}?${params.toString()}`;
  const data = await httpGetJson(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  const items = Array.isArray(data?.data) ? data.data : Array.isArray(data?.articles) ? data.articles : [];
  return items.map((a, idx) =>
    normalizeArticle({
      provider: 'chaingpt',
      id: String(a?.id ?? idx),
      title: a?.title,
      description: a?.description,
      url: a?.url || a?.link,
      imageUrl: a?.imageUrl || a?.image,
      publishedAt: a?.pubDate || a?.createdAt || a?.updatedAt,
      sourceName: a?.category?.name || null,
      sourceUrl: null,
      author: a?.author || null,
      topic: query || null,
    })
  );
}
