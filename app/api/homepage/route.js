import { NextResponse } from "next/server";
import { listClustersWithSamples } from "../../../lib/news/db.js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const clusters = await listClustersWithSamples({ limit: 20, sampleSize: 2 });
    // Map clusters to homepage item shape
    const items = (clusters || []).map((c) => ({
      id: c.id,
      slug: c.id,
      title: c.headline,
      coverage: c.coverage,
      sourceCount: c.size || (c.articles?.length ?? 0),
      imageUrl: c.articles?.[0]?.imageUrl || null,
      summary: [
        ...(c.summary?.left || []),
        ...(c.summary?.center || []),
        ...(c.summary?.right || []),
      ].slice(0, 3),
    }));
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: "Failed to load homepage data" }, { status: 500 });
  }
}
