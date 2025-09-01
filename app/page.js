import Link from "next/link";
import Image from "next/image";
import DailyBriefing from "../components/DailyBriefing";
import BiasBar from "../components/BiasBar";
import RightRail from "../components/RightRail";
import { headers } from "next/headers";

export default async function HomePage() {
  const host = headers().get("host");
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const res = await fetch(`${proto}://${host}/api/homepage`, { cache: 'no-store' });
  const { items } = await res.json();
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return (
    <div className="grid grid-cols-12 gap-[2rem]">
      {/* Left rail: Daily Briefing (desktop only) */}
      <DailyBriefing items={items} />

      {/* Middle section: Top News feed */}
      <section id="newsroom-feed-tablet-and-mobile" className="col-span-12 desktop:col-span-6 desktop:px-[1rem] desktop:pt-[6px] flex flex-col gap-[2rem] px-marginmobile">
        {/* Mobile header */}
        <div className="flex justify-between desktop:hidden">
          <h3 className=" text-16 tablet:text-32 font-semibold">Top News</h3>
          <div className="text-12 font-normal">
            <time dateTime={now.toISOString()}>{dateStr}</time>
          </div>
        </div>

        {/* Desktop header */}
        <div className="hidden desktop:flex justify-between desktop:mt-[200px]">
          <div className="text-12 font-normal">
            <time dateTime={now.toISOString()}>{dateStr}</time>
          </div>
        </div>

        {/* Hero card */}
        {items?.[0] && (
          <div className="relative w-full group">
            <Link href={`/clusters/${items[0].slug}`} className="relative flex flex-col cursor-pointer tablet:gap-[0.6rem] desktop:gap-0">
              <h2 className="hidden">{items[0].title}</h2>
              <div className="relative w-full h-0 pt-[66.666%] tablet:pt-0 tablet:h-auto">
                <div className="absolute inset-0">
                  {items[0].imageUrl && (
                    <Image
                      alt={items[0].title}
                      src={items[0].imageUrl}
                      fill
                      priority
                      className="w-full h-full object-cover"
                      sizes="(max-width: 600px) 95vw, (max-width: 1200px) 50vw, 640w"
                    />
                  )}
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-dark-primary opacity-0 group-hover:opacity-25 transition-opacity duration-200 ease-in z-1" />
                <div className="absolute inset-0 p-[1rem] tablet:p-[1.5rem] bg-gradient-to-t from-dark-primary to-transparent text-light-primary flex-col flex justify-end tablet:hidden desktop:flex z-1">
                  <div className="relative">
                    <h2 className="font-bold group-hover:underline text-22 tablet:text-32 desktop:text-42 leading-10 tablet:leading-14 desktop:leading-18 tracking-tight mt-[8px]">
                      {items[0].title}
                    </h2>
                  </div>
                  <div className="relative mt-[0.7rem] h-[1rem] tablet:h-[1.5rem] tablet:mt-[1rem]">
                    <BiasBar left={items[0].coverage?.left || 0} center={items[0].coverage?.center || 0} right={items[0].coverage?.right || 0} />
                  </div>
                </div>
              </div>
              {/* Tablet-only title + meta under image */}
              <div className="flex-col hidden justify-end tablet:flex desktop:hidden">
                <div className="relative">
                  <h2 className="font-semibold group-hover:underline text-22 tablet:text-32 desktop:text-42 leading-10 tablet:leading-14 desktop:leading-18 tracking-tight mt-[8px]">
                    {items[0].title}
                  </h2>
                </div>
                <div className="relative mt-[0.7rem] h-[1rem] tablet:mt-[1rem]">
                  <div className="flex items-center gap-[0.6rem]">
                    <div className="w-[5rem] h-[8px]">
                      <BiasBar left={items[0].coverage?.left || 0} center={items[0].coverage?.center || 0} right={items[0].coverage?.right || 0} />
                    </div>
                    <div className="text-12 leading-6">
                      <span>{items[0].coverage?.center || 0}% Center coverage: {items[0].sourceCount || 0} sources</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Story list under hero (desktop view) */}
        <div className="hidden tablet:flex flex-col gap-[2rem] ">
          {items?.slice(1, 11).map((it) => (
            <div key={it.id} className="group" data-testid="story-item">
              <div className="relative">
                <Link href={`/clusters/${it.slug}`} className="flex cursor-pointer gap-[1rem] ">
                  <div className="w-[10rem] h-[7.5rem] object-cover hidden tablet:block order-2 " style={{ position: "relative" }}>
                    {it.imageUrl && (
                      <Image
                        alt={it.title}
                        src={it.imageUrl}
                        fill
                        className="object-cover"
                        sizes="225px"
                      />
                    )}
                  </div>
                  <div className="flex flex-col font-normal gap-[8px] w-full">
                    <span className="text-12 leading-6">{it.topic || it.title.split(" ")[0]}<span> · {it.region || "Global"}</span></span>
                    <div className="w-full flex justify-between gap-[0.6rem]">
                      <h4 className="text-22 font-extrabold leading-10 group-hover:underline">{it.title}</h4>
                    </div>
                    <div className="flex items-center gap-[0.6rem]">
                      <div className="w-[5rem] h-[8px]">
                        <BiasBar left={it.coverage?.left || 0} center={it.coverage?.center || 0} right={it.coverage?.right || 0} />
                      </div>
                      <div className="text-12 leading-6"><span>{it.coverage?.center || 0}% Center coverage: {it.sourceCount || 0} sources</span></div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Right rail */}
      <RightRail />
      {/* Divider under top sections */}
      <div className="my-[2rem] tablet:my-0 col-span-12 h-px border-t border-light-heavy px-marginmobile"></div>

      {/* Second row: 9-col list matching middle+right width */}
      <div className="hidden desktop:flex flex-col col-span-12 desktop:col-span-9 gap-[2rem] desktop:pr-[1rem] px-marginmobile">
        {items?.slice(11, 20).map((it) => (
          <div key={it.id} className="group " data-testid="story-item">
            <div className="relative">
              <Link href={`/clusters/${it.slug}`} className="flex cursor-pointer gap-[1rem] ">
                <div className="w-[7.5rem] h-[5.6rem] aspect-video object-cover hidden tablet:block order-2 " style={{ position: "relative" }}>
                  {it.imageUrl && (
                    <Image
                      alt={it.title}
                      src={it.imageUrl}
                      fill
                      className="object-cover"
                      sizes="225px"
                    />
                  )}
                </div>
                <div className="flex flex-col font-normal gap-[8px] w-full">
                  <span className="text-12 leading-6">{it.topic || it.title.split(" ")[0]}<span> · {it.region || "Global"}</span></span>
                  <div className="w-full flex justify-between gap-[0.6rem]">
                    <h4 className="text-22 font-extrabold leading-10 line-clamp-3 group-hover:underline">{it.title}</h4>
                  </div>
                  <div className="flex items-center gap-[0.6rem]">
                    <div className="w-[5rem] h-[8px]">
                      <BiasBar left={it.coverage?.left || 0} center={it.coverage?.center || 0} right={it.coverage?.right || 0} />
                    </div>
                    <div className="text-12 leading-6"><span>{it.coverage?.center || 0}% Center coverage: {it.sourceCount || 0} sources</span></div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Second row: 3-col local news matching right rail width */}
      <div id="newsroom-local" className="col-span-12 desktop:col-span-3 flex flex-col gap-[1rem] desktop:pl-[1rem] desktop:border-l border-l-light-heavy px-marginmobile">
        <h2 className="text-32 font-bold leading-14 mb-[1rem]">Daily Local News</h2>
        <div className="flex flex-col p-0 text-18 text-dark-primary dark:text-light-primary">
          <span className="text-20 leading-10 text-left">Discover stories and media bias happening right in your city.</span>
          <div className="flex mt-[0.9rem] gap-[5px]">
            <div className="w-full text-14 border border-ground-black dark:border-dark-ground-black relative">
              <input id="searchfield" type="text" placeholder="Enter your city's name" autoComplete="on" className="w-full py-[0.6rem] text-16 border-none focus:underline focus:underline-offset-1 dark:bg-ground-black placeholder-[var(--gray-200)] dark:placeholder-[var(--gray-200)] dark:text-light-primary bg-light-primary text-dark-primary" style={{ boxShadow: "none" }} name="searchLocation" />
            </div>
            <button className="bg-ground-black dark:bg-dark-ground-black rounded-lg-s dark:text-dark-primary text-white px-[1.3rem] py-[5px] opacity-70 pointer-events-none">Submit</button>
          </div>
        </div>
        <hr />
      </div>

    </div>
  );
}
