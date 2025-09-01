#!/usr/bin/env node
import 'dotenv/config';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAllNews } from '../lib/news/fetchAll.js';
import { persistArticles } from '../lib/news/persist.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const payload = await fetchAllNews({ sinceISO: since });
    const outDir = path.join(process.cwd(), 'data', 'news');
    const outFile = path.join(outDir, 'daily.json');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`Wrote ${payload.count} articles to ${path.relative(process.cwd(), outFile)}`);

    // Persist to Supabase (no-op if env not configured)
    try {
      const res = await persistArticles(payload.items);
      if (!res?.skipped) console.log(`Persisted ${res.upserted}/${res.total} articles to Supabase`);
    } catch (persistErr) {
      console.warn('Persistence skipped/failed:', persistErr?.message || persistErr);
    }
  } catch (e) {
    console.error('Failed to fetch news:', e?.message || e);
    process.exitCode = 1;
  }
}

main();
