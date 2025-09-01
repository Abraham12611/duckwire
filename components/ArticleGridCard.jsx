import Image from "next/image";
import Link from "next/link";
import BiasBar from "./BiasBar";

export default function ArticleGridCard({ item, variant = "standard", className = "" }) {
  // Use padding-top ratio to avoid requiring Tailwind aspect-ratio plugin
  const padTop = variant === "hero" ? "50%" : variant === "square" ? "100%" : "56.25%"; // 2:1, 1:1, 16:9
  return (
    <article className={`relative overflow-hidden rounded-xl border bg-white ${className}`}>
      <div className="relative w-full" style={{ paddingTop: padTop }}>
        {item.imageUrl && (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            priority={variant === "hero"}
            sizes={variant === "hero" ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <Link href={`/article/${item.slug}`} className="text-white font-semibold text-lg leading-snug hover:underline">
            {item.title}
          </Link>
          {Array.isArray(item.summary) && item.summary.length > 0 && (
            <ul className="mt-2 text-xs text-white/90 space-y-1">
              {item.summary.slice(0, 2).map((s, i) => (
                <li key={i} className="list-disc list-inside">{s}</li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-white">
            <BiasBar left={item.coverage?.left || 0} center={item.coverage?.center || 0} right={item.coverage?.right || 0} />
            {typeof item.sourceCount === "number" && (
              <div className="text-[11px] text-white/80 mt-1">{item.sourceCount} articles</div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
