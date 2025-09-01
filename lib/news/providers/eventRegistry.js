import { httpGetJson, normalizeArticle } from '../utils.js';

// Event Registry (NewsAPI.ai)
// Reference patterns:
// https://eventregistry.org/json/article?action=getArticles&articlesCount=20&articlesSortBy=date&resultType=articles&query={...}
// Auth via apiKey query param.
const BASE = 'https://eventregistry.org/json/article';

export async function fetchEventRegistry({ apiKey, keyword = '', count = 50, lang = 'eng', sortBy = 'date' } = {}) {
  if (!apiKey) return [];

  const queryObj = keyword
    ? { $query: { keyword: keyword, keywordLoc: 'title' } }
    : { $query: { conceptUri: 'http://en.wikipedia.org/wiki/News' } }; // generic fallback

  const params = new URLSearchParams();
  params.set('action', 'getArticles');
  params.set('resultType', 'articles');
  params.set('articlesCount', String(Math.min(count, 100)));
  params.set('articlesSortBy', sortBy);
  params.set('lang', lang);
  params.set('apiKey', apiKey);
  params.set('query', JSON.stringify(queryObj));

  const url = `${BASE}?${params.toString()}`;
  const data = await httpGetJson(url);

  // Typical response shape:
  // { articles: { results: [{ uri, title, url, image, dateTimePub, source: { title, uri } }] } }
  const list = Array.isArray(data?.articles?.results)
    ? data.articles.results
    : Array.isArray(data?.results)
    ? data.results
    : [];

  return list.map((a, idx) =>
    normalizeArticle({
      provider: 'newsapi.ai',
      id: a?.uri || a?.url || String(idx),
      title: a?.title,
      description: a?.body || a?.summary,
      url: a?.url,
      imageUrl: a?.image,
      publishedAt: a?.dateTimePub || a?.date,
      sourceName: a?.source?.title || a?.source?.titleFull,
      sourceUrl: undefined,
      author: null,
      topic: keyword || null,
    })
  );
}
