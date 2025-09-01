import ClusterCard from "../../components/ClusterCard";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ClustersPage() {
  const host = headers().get("host");
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const res = await fetch(`${proto}://${host}/api/clusters`, { cache: "no-store" });
  const { clusters = [] } = await res.json();
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Top Story Clusters</h1>
        <p className="text-sm text-gray-600 mt-1">Automatically grouped stories with bias-aware summaries.</p>
      </header>

      {clusters.length === 0 ? (
        <p className="text-gray-600">No clusters generated yet. Run it from the Admin page.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map((c) => (
            <ClusterCard key={c.id} cluster={c} />
          ))}
        </div>
      )}
    </div>
  );
}
