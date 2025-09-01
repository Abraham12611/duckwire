import Link from "next/link";
import Image from "next/image";
import BiasBar from "./BiasBar";

export default function RightRail() {
  const now = new Date();
  const dateStr = now.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

  return (
    <section className="col-span-12 desktop:col-span-3 flex flex-col gap-[1.5rem] desktop:pl-[1rem] desktop:border-l border-light-heavy px-marginmobile">
      {/* My News Bias (desktop only) */}
      <div className="hidden desktop:block order-1">
        <div id="home-mnb-right" className="flex flex-col gap-[4px] py-[1rem] tablet:gap-[1.5rem]">
          <h2 className="text-22 tablet:text-32 font-extrabold leading-14">My News Bias</h2>
          <div className="flex flex-col gap-[0.6rem]">
            <div className="flex gap-[0.9rem] items-center">
              <Image
                alt="Your profile: Are you biased?"
                src="/duck-wire-logo.png"
                width={60}
                height={60}
                className="rounded-full w-[3.1rem] h-[3.1rem] tablet:w-[3.8rem] tablet:h-[3.8rem] object-cover"
              />
              <div className="flex flex-col gap-[4px]">
                <span className="font-bold text-22 mt-[0.6rem] leading-tight">Sample user</span>
                <span className="text-12 font-normal">0 Stories · 0 Articles</span>
              </div>
            </div>
          </div>
          <div className="h-full text-12 flex text-center whitespace-nowrap overflow-hidden gap-[5px]">
            <div className="text-light-primary bg-ground-new-dark-red leading-none flex items-center py-[5px]" style={{ width: "33%" }}>
              <span className="block w-full text-center">?</span>
            </div>
            <div className="text-dark-primary bg-secondary-neutral leading-none flex items-center py-[5px]" style={{ width: "33%" }}>
              <span className="block w-full text-center">?</span>
            </div>
            <div className="text-light-primary bg-ground-new-dark-blue leading-none flex items-center py-[5px]" style={{ width: "33%" }}>
              <span className="block w-full text-center">?</span>
            </div>
          </div>
          <Link href="/my-news-bias-vantage" className="font-bold mt-[8px] flex justify-center border border-dark-primary dark:border-light-primary rounded-[6px] py-[0.7rem] text-16 w-full">
            See the demo
          </Link>
        </div>
      </div>

      {/* Blindspot header row */}
      <div className="flex w-full justify-between items-center">
        <div className="relative shrink-0 cursor-pointer">
          <Link aria-label="Go to Blindspot" href="/blindspot" className="text-dark-primary dark:text-light-primary font-extrabold text-22">
            Blindspot
          </Link>
        </div>
        <span className="text-12 font-normal text-right desktop:hidden">
          <time dateTime={now.toISOString()}>{dateStr}</time>
        </span>
      </div>

      <p className="text-15 font-light leading-[120%]">
        Stories disproportionately covered by one side of the political spectrum.{' '}
        <Link className="underline font-semibold" href="/blindspot/about">Learn more about political bias in news coverage.</Link>
      </p>

      {/* Blindspot cards container */}
      <div id="newsroom-blindspot" className="flex flex-col tablet:flex-row desktop:flex-col gap-[1.5rem]">
        <BlindspotCard
          href="/article/sample-blindspot-red"
          tone="red"
          tag="Blindspot"
          sources={12}
          title="Former Twin Luis Arraez receives warm welcome back: 'He did great things for us'"
          bias={{ left: 0, center: 50, right: 50 }}
        />
        <BlindspotCard
          href="/article/sample-blindspot-blue"
          tone="blue"
          tag="Blindspot"
          sources={8}
          title="RFK Jr. has never been briefed by CDC experts on measles, COVID-19 or flu, former official says"
          bias={{ left: 75, center: 25, right: 0 }}
        />
      </div>

      <div id="newsroom-blindspot-click" className="self-stretch tablet:self-start desktop:self-stretch">
        <Link href="/blindspot" className="px-[0.7rem] py-[0.7rem] text-16 rounded-[4px] font-bold leading-10 whitespace-nowrap border flex shrink items-center border-dark-primary dark:border-light-primary text-dark-primary dark:text-light-primary hover:text-light-heavy active:text-light-heavy">
          <span className="w-full text-center font-bold">View Blindspot Feed</span>
        </Link>
      </div>
    </section>
  );
}

function BlindspotCard({ href, tone = "red", tag = "Blindspot", sources = 0, title = "", bias = { left: 33, center: 34, right: 33 } }) {
  const toneBg = tone === "blue" ? "bg-ground-new-dark-blue" : "bg-ground-new-dark-red";
  const toneText = "text-light-primary";
  return (
    <div className="w-full tablet:w-1/2 desktop:w-full group">
      <Link href={href} className={`h-full cursor-pointer ${toneBg} ${toneText} rounded-[8px] p-[8px] flex flex-col`}>
        <div className="flex flex-col h-full gap-[8px] bg-light-light text-dark-primary dark:bg-dark-primary dark:text-light-primary rounded-[8px]">
          <div className="h-[10rem] min-w-full object-cover relative">
            <div className="absolute inset-0 bg-light-primary dark:bg-dark-light" />
            <div className="absolute top-0 left-0 w-full h-full bg-dark-primary opacity-0 group-hover:opacity-25 transition-opacity duration-200 ease-in z-1" />
          </div>
          <div className="flex flex-col gap-[8px] p-[8px] grow">
            <div className="flex gap-[8px]">
              <div className="flex items-center gap-[4px] font-normal">
                <span className={`py-[5px] rounded-[4px] text-12 leading-6 flex items-center ${toneBg} ${toneText} px-[4px] font-semibold`}>{tag}</span>
              </div>
              <span className="py-[5px] rounded-[4px] text-12 leading-6 flex items-center bg-white text-dark-primary px-[4px]">{sources} Sources</span>
            </div>
            <h4 title={title} className="font-extrabold text-22 leading-10 group-hover:underline">{title}</h4>
            <div className="w-full mt-auto">
              <BiasBar left={bias.left} center={bias.center} right={bias.right} />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
