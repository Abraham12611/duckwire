import Link from "next/link";
import BiasBar from "./BiasBar";

export default function StoryCard({ cluster }) {
  return (
    <article className="border rounded-lg p-4 bg-white">
      <Link href={`/article/${cluster.slug}`} className="text-lg font-semibold hover:underline">
        {cluster.title}
      </Link>
      {Array.isArray(cluster.summary) && cluster.summary.length > 0 && (
        <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
          {cluster.summary.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        <BiasBar left={cluster.coverage.left} center={cluster.coverage.center} right={cluster.coverage.right} />
        <div className="text-xs text-gray-500 mt-1">{cluster.sourceCount} articles</div>
      </div>
    </article>
  );
}
