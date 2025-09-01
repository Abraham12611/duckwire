import BiasBar from "../../../components/BiasBar";
import ClusterShareBar from "../../../components/ClusterShareBar";
import ClusterSummaryTabs from "../../../components/ClusterSummaryTabs";
import ArticleListWithBiasTabs from "../../../components/ArticleListWithBiasTabs";
import Link from "next/link";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ClusterDetailPage({ params }) {
  const host = headers().get("host");
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const res = await fetch(`${proto}://${host}/api/clusters/${params.slug}`, { next: { revalidate: 60 } });
  const { cluster = null } = await res.json();
  if (!cluster) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Cluster not found. <Link href="/clusters" className="text-blue-600 hover:underline">Back to clusters</Link></p>
      </div>
    );
  }

  const left = cluster.summary?.left || [];
  const center = cluster.summary?.center || [];
  const right = cluster.summary?.right || [];
  const cov = cluster.coverage || { left: 0, center: cluster.size ?? 0, right: 0 };
  const articles = Array.isArray(cluster.articles) ? cluster.articles : [];

  // Compute top info bar metrics
  const avgPublishedAt = (() => {
    const times = articles.map((a) => (a.publishedAt ? new Date(a.publishedAt).getTime() : null)).filter(Boolean);
    if (!times.length) return null;
    const avg = Math.round(times.reduce((s, t) => s + t, 0) / times.length);
    return new Date(avg);
  })();

  function timeAgo(d) {
    if (!d) return "";
    const now = Date.now();
    const diff = Math.max(0, now - d.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 48) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  function inferRegion(urls = []) {
    const regions = {
      UK: [".uk", ".co.uk"],
      Europe: [".de", ".fr", ".it", ".es", ".eu", ".nl", ".se", ".no", ".dk", ".fi", ".pl"],
      Africa: [".ng", ".ke", ".za", ".gh", ".tz", ".ug", ".rw", ".et"],
      Asia: [".in", ".pk", ".jp", ".sg", ".cn", ".kr", ".ae", ".sa", ".id", ".ph", ".bd", ".my"],
      Australia: [".au"],
      Canada: [".ca"],
      US: [".us"],
    };
    const counts = Object.fromEntries(Object.keys(regions).map((k) => [k, 0]));
    for (const u of urls) {
      try {
        const h = new URL(u).hostname.toLowerCase();
        let matched = false;
        for (const [region, tlds] of Object.entries(regions)) {
          if (tlds.some((t) => h.endsWith(t))) {
            counts[region]++;
            matched = true;
            break;
          }
        }
        if (!matched) {
          // Generic TLDs (.com/.org/.net) — do not assign
        }
      } catch {}
    }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!best || best[1] === 0) return "Worldwide";
    if (best[0] === "US") return "United States";
    return best[0];
  }

  const region = inferRegion(articles.map((a) => a.url).filter(Boolean));
  const clusterCreatedAt = cluster.generatedAt ? new Date(cluster.generatedAt) : null;
  const pageUrl = `${proto}://${host}/clusters/${params.slug}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Top info bar */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border rounded p-3 bg-white/50">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
          <div><span className="text-gray-500">Published</span> {avgPublishedAt ? timeAgo(avgPublishedAt) : "—"}</div>
          <span className="text-gray-300">•</span>
          <div><span className="text-gray-500">Country</span> {region}</div>
          <span className="text-gray-300">•</span>
          <div><span className="text-gray-500">Updated</span> {clusterCreatedAt ? timeAgo(clusterCreatedAt) : "—"}</div>
        </div>
        <ClusterShareBar url={pageUrl} title={cluster.headline || "Story Cluster"} />
      </section>

      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{cluster.headline || "Story Cluster"}</h1>
        <BiasBar left={cov.left} center={cov.center} right={cov.right} />
        <p className="text-sm text-gray-600">{cluster.size || articles.length} articles</p>
      </header>

      {/* Summary tabs */}
      <section>
        <ClusterSummaryTabs left={left} center={center} right={right} />
      </section>

      {/* Articles with bias tabs */}
      <section className="space-y-2">
        <h2 className="font-medium">Sources</h2>
        <ArticleListWithBiasTabs articles={articles} />
      </section>

      <div>
        <Link href="/clusters" className="text-blue-600 hover:underline">← Back to clusters</Link>
      </div>
    </div>
  );
}
