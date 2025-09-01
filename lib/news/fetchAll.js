import { dedupeArticles } from './utils.js';
import { fetchNewsapiOrg } from './providers/newsapiOrg.js';
import { fetchGNews } from './providers/gnews.js';
import { fetchNewsdata } from './providers/newsdata.js';
import { fetchChaingpt } from './providers/chaingpt.js';
import { fetchEventRegistry } from './providers/eventRegistry.js';

function defaultQueries() {
  // Core topics for DuckWire; tweak as needed
  return [
    'crypto OR blockchain OR bitcoin OR ethereum',
    'AI OR artificial intelligence OR machine learning',
    'web3 OR defi OR nft',
  ];
}

export async function fetchAllNews({
  queries = defaultQueries(),
  sinceISO, // optional ISO datetime to bound results
  maxPerProvider = 40,
} = {}) {
  const {
    NEWSAPI_ORG_KEY,
    GNEWS_API_KEY,
    NEWSDATA_API_KEY,
    CHAINGPT_API_KEY,
    NEWSAPI_AI_API_KEY,
  } = process.env;

  const tasks = [];

  for (const q of queries) {
    if (NEWSAPI_ORG_KEY) tasks.push(fetchNewsapiOrg({ apiKey: NEWSAPI_ORG_KEY, q, from: sinceISO, pageSize: maxPerProvider }));
    if (GNEWS_API_KEY) tasks.push(fetchGNews({ apiKey: GNEWS_API_KEY, q, max: maxPerProvider, lang: 'en' }));
    if (NEWSDATA_API_KEY) tasks.push(fetchNewsdata({ apiKey: NEWSDATA_API_KEY, q, language: 'en' }));
    if (CHAINGPT_API_KEY) tasks.push(fetchChaingpt({ apiKey: CHAINGPT_API_KEY, query: q, limit: maxPerProvider }));
    if (NEWSAPI_AI_API_KEY) tasks.push(fetchEventRegistry({ apiKey: NEWSAPI_AI_API_KEY, keyword: q, count: maxPerProvider }));
  }

  const results = await Promise.allSettled(tasks);
  const all = [];
  for (const r of results) {
    if (r.status === 'fulfilled' && Array.isArray(r.value)) all.push(...r.value);
  }

  const deduped = dedupeArticles(all);
  deduped.sort((a, b) => {
    const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return tb - ta;
  });

  return {
    fetchedAt: new Date().toISOString(),
    count: deduped.length,
    items: deduped,
  };
}
