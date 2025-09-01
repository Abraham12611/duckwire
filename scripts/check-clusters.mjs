import 'dotenv/config';
import { listClustersWithSamples } from '../lib/news/db.js';

try {
  const clusters = await listClustersWithSamples({ limit: 5, sampleSize: 2 });
  console.log('clusters_count', clusters.length);
  console.log('first_cluster', JSON.stringify(clusters[0] || null));
} catch (e) {
  console.error('error', e?.message || e);
  process.exit(1);
}
