import Image from "next/image";
import Link from "next/link";
import BiasBar from "./BiasBar";

export default function DailyBriefing({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const hero = items[0];
  const stories = items.length;
  const articles = items.reduce((sum, it) => sum + (it.sourceCount || 0), 0);
  const minutes = Math.max(1, Math.round(stories * 3));
  const summaryBits = Array.isArray(hero.summary) ? hero.summary.slice(0, 3) : [];

  return (
    <section className="hidden desktop:flex flex-col col-span-3 gap-[2rem] pr-[1rem] border-r border-light-heavy px-marginmobile">
      <h3 className="text-32 font-extrabold cursor-pointer">Daily Briefing</h3>

      <div className="hidden desktop:block">
        <Link
          href="/daily-briefing"
          className="group flex flex-col rounded-[8px] overflow-hidden gap-[6px] bg-white dark:bg-dark-light border border-tertiary-light dark:border-dark-light pb-[1rem] desktop:py-0"
        >
          {/* Image block */}
          <div className="flex flex-col gap-[1rem] w-full cursor-pointer">
            <div className="relative flex flex-col gap-[0.6rem] mb-[6px] w-full desktop:h-[12.5rem] overflow-hidden">
              <div className="relative w-full h-0 pt-[56.25%] overflow-hidden">
                <div className="absolute inset-0">
                  <div className="relative w-full h-full">
                    <div className="w-full h-full relative overflow-hidden">
                      {/* Blurred underlay */}
                      <div className="w-full h-full object-cover blur-sm scale-110">
                        <div className="relative w-full h-full">
                          <div className="absolute inset-0 w-full h-full">
                            {hero.imageUrl && (
                              <Image
                                src={hero.imageUrl}
                                alt={hero.title}
                                fill
                                priority
                                className="w-full h-full object-cover"
                                sizes="(max-width: 600px) 95vw, (max-width: 1200px) 50vw, 25vw"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Foreground centered image (contain) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {hero.imageUrl && (
                    <Image
                      src={hero.imageUrl}
                      alt={hero.title}
                      fill
                      className="max-w-full max-h-full object-contain"
                      sizes="(max-width: 600px) 95vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  )}
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-dark-primary opacity-0 group-hover:opacity-25 transition-opacity duration-200 ease-in z-1" />
            </div>
          </div>

          {/* Counts (mobile + desktop variants) */}
          <span className="relative text-18 font-normal desktop:hidden px-[1.3rem] cursor-pointer flex">
            {stories} stories 
            <span className="mx-1">•</span> {articles} articles 
            <span className="mx-1">•</span> {minutes}m read
          </span>
          <span className="relative z-10 text-14 font-normal hidden desktop:flex leading-snug px-[1.3rem] cursor-pointer">
            {stories} stories 
            <span className="mx-1">•</span> {articles} articles 
            <span className="mx-1">•</span> {minutes}m read
          </span>

          {/* Headline + bullets */}
          <div className="flex flex-col gap-[1rem] w-full px-[12px] pb-[1.3rem]">
            <span className="text-18 leading-tight font-extrabold cursor-pointer">
              {hero.title}
            </span>
            {hero.summary?.[0] && (
              <span className="text-15 font-normal leading-tight cursor-pointer">
                {hero.summary[0]}
              </span>
            )}
            {summaryBits.length > 0 && (
              <div className="whitespace-normal break-words cursor-pointer">
                <span className="font-normal mr-[0.6rem] text-15">+</span>
                {summaryBits.map((s, i) => (
                  <span key={i} className="text-15 underline font-normal hover:underline inline mr-[6px]">
                    {s}{i < summaryBits.length - 1 ? ';' : ''}
                  </span>
                ))}
                <span className="text-15 underline font-normal hover:underline">and more.</span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Top News Stories list */}
      <div className="relative">
        <h2 className="text-32 font-extrabold leading-14">Top News Stories</h2>
      </div>
      <div className="flex flex-col gap-y-[1rem]">
        {items.slice(1, 5).map((it, idx) => (
          <div key={it.id || idx} className="flex flex-col gap-[1rem] group">
            <div className="relative">
              <Link href={`/article/${it.slug}`} className="flex cursor-pointer gap-[1rem]">
                <div className="flex flex-col font-normal gap-[8px] w-full">
                  <div className="w-full flex justify-between gap-[0.6rem]">
                    <h4 className="text-22 font-extrabold leading-10 group-hover:underline">
                      {it.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-[0.6rem]">
                    <div className="w-[5rem] h-[8px]">
                      <BiasBar left={it.coverage?.left || 0} center={it.coverage?.center || 0} right={it.coverage?.right || 0} />
                    </div>
                    <div className="text-12 leading-6">
                      <span>
                        Coverage: {it.sourceCount || it.coverage?.total || 0} sources
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            <hr className="border border-light-light dark:border-light-primary" />
          </div>
        ))}
      </div>
    </section>
  );
}
