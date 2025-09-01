import Link from "next/link";
import BiasBar from "./BiasBar";

function uniqueSourcesFrom(cluster) {
  // Prefer AI-provided sources; fallback to article.sourceName/provider
  const srcSet = new Set([
    ...(cluster.sources?.left || []),
    ...(cluster.sources?.center || []),
    ...(cluster.sources?.right || []),
  ].filter(Boolean));
  if (srcSet.size === 0 && Array.isArray(cluster.articles)) {
    for (const a of cluster.articles) {
      srcSet.add(a?.sourceName || a?.provider || "");
    }
  }
  srcSet.delete("");
  return Array.from(srcSet);
}

export default function ClusterCard({ cluster, className = "" }) {
  const sources = uniqueSourcesFrom(cluster);
  const l = cluster.coverage?.left || 0;
  const c = cluster.coverage?.center || 0;
  const r = cluster.coverage?.right || 0;

  return (
    <article className={`border rounded-xl p-4 bg-white ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Link href={`/clusters/${cluster.id}`} className="text-lg font-semibold hover:underline">
            {cluster.headline || "Story Cluster"}
          </Link>
          <div className="mt-2">
            <BiasBar left={l} center={c} right={r} />
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {cluster.size || (cluster.articles?.length ?? 0)} articles · {sources.length} sources
          </div>
          {cluster.summary ? (
            <ul className="mt-3 text-sm list-disc list-inside space-y-1">
              {[...(cluster.summary.left || []), ...(cluster.summary.center || []), ...(cluster.summary.right || [])]
                .slice(0, 3)
                .map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
            </ul>
          ) : null}
        </div>
        <div className="text-right">
          <Link href={`/clusters/${cluster.id}`} className="text-sm text-blue-600 hover:underline">
            View details →
          </Link>
        </div>
      </div>
      {sources.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {sources.slice(0, 6).map((s) => (
            <span key={s} className="px-2 py-0.5 text-xs rounded-full border bg-gray-50">
              {s}
            </span>
          ))}
          {sources.length > 6 ? (
            <span className="px-2 py-0.5 text-xs text-gray-600">+{sources.length - 6} more</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
