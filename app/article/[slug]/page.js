import BiasBar from "../../../components/BiasBar";
import Link from "next/link";
import { getCluster } from "../../../lib/mockData";

export default function ArticlePage({ params, searchParams }) {
  const { slug } = params;
  const view = searchParams?.view ?? "all";
  const sort = searchParams?.sort ?? "newest"; // newest | oldest
  const cluster = getCluster(slug);

  if (!cluster) {
    return <div className="text-sm text-gray-600">Cluster not found.</div>;
  }

  const counts = {
    total: cluster.coverage.total ?? cluster.sourceCount,
    left: cluster.coverage.left,
    center: cluster.coverage.center,
    right: cluster.coverage.right,
  };

  const sources = Array.isArray(cluster.sources) ? cluster.sources : [];
  const filteredSources = sources.filter((s) => (view === "all" ? true : s.bias === view));
  const sortedSources = filteredSources
    .slice()
    .sort((a, b) => (sort === "newest" ? a.hoursAgo - b.hoursAgo : b.hoursAgo - a.hoursAgo));
  const byBias = {
    left: sources.filter((s) => s.bias === "left"),
    center: sources.filter((s) => s.bias === "center"),
    right: sources.filter((s) => s.bias === "right"),
  };

  // Unique outlets for the summary sources toggle
  const summaryOutlets = Array.from(new Set(sources.map((s) => s.outlet)));

  // Percentages and majority label
  const totalCount = counts.total || 0;
  const percentages = totalCount
    ? {
        left: Math.round((counts.left / totalCount) * 100),
        center: Math.round((counts.center / totalCount) * 100),
        right: Math.round((counts.right / totalCount) * 100),
      }
    : { left: 0, center: 0, right: 0 };
  const majorityBias = ["left", "center", "right"].reduce(
    (acc, k) => (percentages[k] > percentages[acc] ? k : acc),
    "left"
  );
  const lastUpdatedHours = sources.length ? Math.min(...sources.map((s) => s.hoursAgo)) : null;

  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Header */}
      <header className="lg:col-span-5 space-y-4 lg: lg:top-24 self-start">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">{cluster.title}</h1>
          {/* Share controls (placeholders for now) */}
          <div className="hidden md:flex items-center gap-2">
            <a href="#" aria-label="Copy link" className="p-2 rounded border text-gray-600 hover:bg-gray-50">⧉</a>
            <a href="#" aria-label="Share" className="p-2 rounded border text-gray-600 hover:bg-gray-50">↗</a>
          </div>
        </div>
        {/* AI Summary */}
        {cluster.summary && (
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-800">AI Summary</h2>
            <ul className="list-disc pl-4 space-y-1 text-sm text-gray-700 leading-relaxed">
              {cluster.summary.map((sent, idx) => (
                <li key={idx}>{sent}</li>
              ))}
            </ul>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-800">Show sources referenced</summary>
              <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                {summaryOutlets.slice(0, 8).map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </details>
          </section>
        )}
        <BiasBar left={counts.left} center={counts.center} right={counts.right} />
        <div className="text-xs text-gray-600">
          <span className="font-semibold">
            {percentages[majorityBias]}% {majorityBias.charAt(0).toUpperCase() + majorityBias.slice(1)}
          </span>
          <span className="ml-2">L {percentages.left}% | C {percentages.center}% | R {percentages.right}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm" role="tablist" aria-label="Bias Comparison">
          <span className="font-semibold">Perspectives:</span>
          <Link href={`?view=left&sort=${sort}`} role="tab" aria-selected={view==='left'} className={`px-2 py-1 rounded border ${view==='left'? 'bg-gray-100 border-gray-400' : 'border-gray-200'}`}>Left ({counts.left})</Link>
          <Link href={`?view=center&sort=${sort}`} role="tab" aria-selected={view==='center'} className={`px-2 py-1 rounded border ${view==='center'? 'bg-gray-100 border-gray-400' : 'border-gray-200'}`}>Center ({counts.center})</Link>
          <Link href={`?view=right&sort=${sort}`} role="tab" aria-selected={view==='right'} className={`px-2 py-1 rounded border ${view==='right'? 'bg-gray-100 border-gray-400' : 'border-gray-200'}`}>Right ({counts.right})</Link>
        </div>
      </header>

      {/* Sources + filters */}
      <section className="lg:col-span-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b pb-2 mb-3">
          <h3 className="font-semibold">{counts.total} Articles</h3>
          <div className="flex items-center gap-2 text-sm" role="tablist" aria-label="Article Filters">
            <Link href={`?view=all&sort=${sort}`} role="tab" aria-selected={view==='all'} className={`px-2 py-1 rounded ${view==='all'?'border-b-2 border-brand-ink':''}`}>All</Link>
            <Link href={`?view=left&sort=${sort}`} role="tab" aria-selected={view==='left'} className={`px-2 py-1 rounded ${view==='left'?'border-b-2 border-brand-ink':''}`}>Left {counts.left}</Link>
            <Link href={`?view=center&sort=${sort}`} role="tab" aria-selected={view==='center'} className={`px-2 py-1 rounded ${view==='center'?'border-b-2 border-brand-ink':''}`}>Center {counts.center}</Link>
            <Link href={`?view=right&sort=${sort}`} role="tab" aria-selected={view==='right'} className={`px-2 py-1 rounded ${view==='right'?'border-b-2 border-brand-ink':''}`}>Right {counts.right}</Link>
          </div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="text-gray-500">Sort:</span>
            <Link href={`?view=${view}&sort=newest`} className={`px-2 py-1 rounded ${sort==='newest'?'border-b-2 border-brand-ink':''}`}>Newest</Link>
            <Link href={`?view=${view}&sort=oldest`} className={`px-2 py-1 rounded ${sort==='oldest'?'border-b-2 border-brand-ink':''}`}>Oldest</Link>
          </div>
        </div>
        <ul className="space-y-3">
          {sortedSources.map((s) => (
            <li key={s.id} className="border rounded p-3 bg-white">
              <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
                <span>{s.outlet} · {s.hoursAgo} hours ago</span>
                <span className={`px-2 py-0.5 rounded-full border ${
                  s.bias === 'left' ? 'bg-bias-left-300 text-bias-left-900 border-bias-left-500' :
                  s.bias === 'center' ? 'bg-bias-center-200 text-bias-center-700 border-bias-center-400' :
                  'bg-bias-right-300 text-bias-right-900 border-bias-right-500'
                }`}>{s.bias}</span>
              </div>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 block font-medium hover:underline">{s.headline}</a>
            </li>
          ))}
        </ul>
      </section>

      {/* Sidebar */}
      <aside className="lg:col-span-3 space-y-3">
        <div className="border rounded p-3 bg-white">
          <h3 className="font-semibold mb-2">Coverage Details</h3>
          <div className="text-sm text-gray-600">Total sources: {counts.total}</div>
          <div className="text-sm text-gray-600">Majority: <span className="font-medium">{percentages[majorityBias]}% {majorityBias.charAt(0).toUpperCase() + majorityBias.slice(1)}</span></div>
          <div className="text-sm text-gray-600">Last updated: {lastUpdatedHours !== null ? `${lastUpdatedHours}h ago` : '—'}</div>
          <div className="mt-3">
            <BiasBar left={counts.left} center={counts.center} right={counts.right} />
            <div className="mt-1 text-xs text-gray-600">L {percentages.left}% | C {percentages.center}% | R {percentages.right}%</div>
          </div>
        </div>
        <div className="border rounded p-3 bg-white">
          <h3 className="font-semibold mb-2">Top sources by bias</h3>
          {(["left","center","right"]).map((b) => {
            const top = byBias[b].slice().sort((a,b)=>a.hoursAgo-b.hoursAgo).slice(0,3);
            return (
              <div key={b} className="mb-3 last:mb-0">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{b}</div>
                <ul className="space-y-1">
                  {top.length === 0 && (
                    <li className="text-xs text-gray-500">No sources yet</li>
                  )}
                  {top.map((s) => (
                    <li key={s.id} className="text-sm">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{s.outlet}</a>
                      <span className="text-xs text-gray-500"> · {s.hoursAgo}h</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </aside>
    </article>
  );
}

