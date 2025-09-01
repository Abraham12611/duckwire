import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

const RATINGS = [
  'far-left',
  'left-leaning',
  'left-center',
  'center',
  'right-center',
  'right-leaning',
  'far-right',
];

const SCORE = {
  'far-left': -3,
  'left-leaning': -2,
  'left-center': -1,
  'center': 0,
  'right-center': 1,
  'right-leaning': 2,
  'far-right': 3,
};

function votesFilePath() {
  return path.join(process.cwd(), 'data', 'bias-votes.json');
}

async function readVotes() {
  try {
    const p = votesFilePath();
    const buf = await fs.readFile(p, 'utf8');
    const json = JSON.parse(buf || '{}');
    return Array.isArray(json.votes) ? json.votes : [];
  } catch {
    return [];
  }
}

async function writeVotes(votes) {
  const p = votesFilePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify({ votes }, null, 2), 'utf8');
}

function summarizeAll(votes, onlyProvider) {
  const byProv = new Map();
  for (const v of votes) {
    if (!v || typeof v !== 'object') continue;
    if (onlyProvider && v.provider !== onlyProvider) continue;
    const key = v.provider;
    if (!key) continue;
    if (!byProv.has(key)) byProv.set(key, []);
    byProv.get(key).push(v);
  }
  const result = {};
  for (const [prov, arr] of byProv.entries()) {
    const counts = Object.fromEntries(RATINGS.map((r) => [r, 0]));
    let wSum = 0;
    let wsSum = 0;
    let stakeTotal = 0;
    let voters = 0;
    for (const v of arr) {
      if (!RATINGS.includes(v.rating)) continue;
      const stake = Number(v.stake || 0);
      if (!(stake >= 20)) continue; // min stake 20 DUCK
      const w = Math.sqrt(stake); // sqrt-weighted
      const s = SCORE[v.rating];
      counts[v.rating] += 1;
      stakeTotal += stake;
      voters += 1;
      wSum += w;
      wsSum += w * s;
    }
    let avgScore = 0;
    if (wSum > 0) avgScore = wsSum / wSum;
    // Map avgScore to nearest rating label
    const nearest = (() => {
      if (wSum === 0) return 'center';
      const round = Math.max(-3, Math.min(3, Math.round(avgScore)));
      const label = Object.entries(SCORE).find(([, v]) => v === round)?.[0] || 'center';
      return label;
    })();
    result[prov] = {
      counts,
      averageScore: avgScore,
      averageLabel: nearest,
      totalStake: stakeTotal,
      voters,
    };
  }
  return result;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider') || undefined;
    const votes = await readVotes();
    const summary = summarizeAll(votes, provider);
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to read votes' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const provider = (body?.provider || '').trim();
    const rating = (body?.rating || '').toLowerCase();
    const stake = Number(body?.stake || 0);
    const voter = (body?.voter || '').trim();
    if (!provider) return NextResponse.json({ error: 'Missing provider' }, { status: 400 });
    if (!RATINGS.includes(rating)) return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    if (!(stake >= 20)) return NextResponse.json({ error: 'Minimum stake is 20 DUCK' }, { status: 400 });

    const votes = await readVotes();
    votes.push({ provider, rating, stake, voter, ts: Date.now() });
    await writeVotes(votes);

    const summary = summarizeAll(votes, provider);
    return NextResponse.json({ ok: true, summary });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save vote' }, { status: 500 });
  }
}
