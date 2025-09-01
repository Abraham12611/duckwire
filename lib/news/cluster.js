// Lightweight text-based clustering over news articles with AI summary integration
// - Greedy single-linkage clustering using cosine similarity over TF-IDF vectors
// - Robust to missing API keys (returns placeholders)

import crypto from 'crypto';
import { callChatCompletion } from '../ai/openrouter.js';

const STOPWORDS = new Set([
  'the','and','for','with','that','this','are','was','were','from','have','has','had','but','not','you','your','our','their','they','his','her','its','about','into','over','under','after','before','between','among','within','without','than','then','them','there','here','what','which','who','whom','why','how','when','where','also','can','could','should','would','may','might','will','shall','on','in','at','to','of','by','as','is','it','be','or','an','a'
]);

function tokenize(text = '') {
  return (text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

function buildTf(tokens) {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
}

function computeIdf(allDocsTf) {
  const df = new Map();
  const N = allDocsTf.length;
  for (const tf of allDocsTf) {
    for (const term of tf.keys()) df.set(term, (df.get(term) || 0) + 1);
  }
  const idf = new Map();
  for (const [term, d] of df) idf.set(term, Math.log((N + 1) / (d + 1)) + 1);
  return idf;
}

function toTfidf(tf, idf) {
  const vec = new Map();
  let norm = 0;
  for (const [term, f] of tf) {
    const w = f * (idf.get(term) || 0);
    if (w <= 0) continue;
    vec.set(term, w);
    norm += w * w;
  }
  norm = Math.sqrt(norm) || 1;
  // L2 normalize
  for (const [term, w] of vec) vec.set(term, w / norm);
  return vec;
}

function cosineSim(a, b) {
  // a, b are Map(term->weight) and already normalized
  if (!a || !b) return 0;
  let dot = 0;
  const smaller = a.size < b.size ? a : b;
  const larger = a.size < b.size ? b : a;
  for (const [t, w] of smaller) {
    const v = larger.get(t);
    if (v) dot += w * v;
  }
  return dot;
}

function vectorizeArticles(articles) {
  const docs = articles.map(a => tokenize(`${a.title || ''} ${a.description || ''}`));
  const tfs = docs.map(buildTf);
  const idf = computeIdf(tfs);
  const vecs = tfs.map(tf => toTfidf(tf, idf));
  return vecs;
}

export function buildClusters(articles, { simThreshold = 0.28, maxClusters = 20 } = {}) {
  if (!Array.isArray(articles) || articles.length === 0) return [];
  const vectors = vectorizeArticles(articles);
  const clusters = [];

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const vec = vectors[i];
    let bestIdx = -1;
    let bestSim = 0;

    for (let c = 0; c < clusters.length; c++) {
      const cluster = clusters[c];
      // single-linkage: max sim to any member
      let maxSim = 0;
      for (const m of cluster.members) {
        const s = cosineSim(vec, m.vec);
        if (s > maxSim) maxSim = s;
      }
      if (maxSim > bestSim) {
        bestSim = maxSim;
        bestIdx = c;
      }
    }

    if (bestIdx >= 0 && bestSim >= simThreshold) {
      clusters[bestIdx].members.push({ art, vec });
    } else {
      clusters.push({ members: [{ art, vec }] });
    }
  }

  // sort clusters by size desc and trim
  clusters.sort((a, b) => b.members.length - a.members.length);
  const trimmed = clusters.slice(0, maxClusters);

  // construct output shape with ID
  return trimmed.map((c, idx) => {
    const articles = c.members.map(m => m.art);
    const hash = crypto
      .createHash('sha1')
      .update(articles.map(a => a.title || a.url || '').join('|'))
      .digest('hex')
      .slice(0, 10);
    return {
      id: `c_${hash}`,
      size: articles.length,
      articles,
    };
  });
}

export async function summarizeCluster(cluster) {
  const articles = cluster.articles.map(a => ({
    title: a.title,
    source: a.sourceName || a.provider || 'Unknown',
    url: a.url,
    description: a.description || '',
  }));

  const sys = `You are a news clustering assistant for DuckWire.
- Output ONLY valid minified JSON matching the schema.
- Be bias-aware: summarize perspectives by Left, Center, Right.
- Keep total bullets <= 6 across all groups.
- Headline should be 10-16 words, neutral and descriptive.`;

  const user = `Schema:
{
  "headline": string,
  "summary": { "left": string[], "center": string[], "right": string[] },
  "coverage": { "left": number, "center": number, "right": number },
  "sources": { "left": string[], "center": string[], "right": string[] }
}

Articles:
${JSON.stringify(articles).slice(0, 16000)}

Instructions:
1) Infer outlet bias from source names to estimate coverage counts and source lists.
2) Provide concise bullets; avoid redundancy.
3) If unsure of a source's bias, classify it as center.`;

  const { content } = await callChatCompletion([
    { role: 'system', content: sys },
    { role: 'user', content: user },
  ], { temperature: 0.2, maxTokens: 700 });

  // try parse JSON, strip code fences if any
  const parsed = safeParseJson(content);
  return {
    id: cluster.id,
    size: cluster.size,
    articles: cluster.articles,
    headline: parsed.headline || cluster.articles[0]?.title || 'Story Cluster',
    summary: parsed.summary || { left: [], center: [], right: [] },
    coverage: parsed.coverage || { left: 0, center: cluster.size, right: 0 },
    sources: parsed.sources || { left: [], center: Array.from(new Set(articles.map(a => a.source))), right: [] },
  };
}

function safeParseJson(text) {
  try {
    const clean = text
      .replace(/^```json\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/```\s*$/i, '')
      .trim();
    return JSON.parse(clean);
  } catch {
    try {
      // attempt to find first {...}
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start >= 0 && end > start) return JSON.parse(text.slice(start, end + 1));
    } catch {}
    return {};
  }
}
