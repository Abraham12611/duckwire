"use client";
import { useEffect, useMemo, useState } from "react";

const RATING_OPTIONS = [
  { key: "far-left", label: "Far Left" },
  { key: "left-leaning", label: "Left-leaning" },
  { key: "left-center", label: "Left-center" },
  { key: "center", label: "Center" },
  { key: "right-center", label: "Right-center" },
  { key: "right-leaning", label: "Right-leaning" },
  { key: "far-right", label: "Far Right" },
];

// Expects articles: [{ title, url, description?, publishedAt, provider, imageUrl?, bias? }]
// bias can be one of 'left' | 'center' | 'right'
export default function ArticleListWithBiasTabs({ articles = [] }) {
  const [tab, setTab] = useState("all");
  const [biasMap, setBiasMap] = useState({}); // { [provider]: 'left'|'center'|'right' }
  const [hiddenProviders, setHiddenProviders] = useState(new Set());
  const [menuOpen, setMenuOpen] = useState(null); // index of open menu
  const [voteOpen, setVoteOpen] = useState(false);
  const [voteProvider, setVoteProvider] = useState("");
  const [voteRating, setVoteRating] = useState("center");
  const [voteStake, setVoteStake] = useState(20);
  const [voteBusy, setVoteBusy] = useState(false);
  const [voteError, setVoteError] = useState("");

  const tabs = [
    { key: "all", label: "All" },
    { key: "left", label: "Left" },
    { key: "center", label: "Center" },
    { key: "right", label: "Right" },
  ];

  useEffect(() => {
    // Load stored source bias mapping
    fetch("/api/source-bias", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setBiasMap(j?.map || {}))
      .catch(() => {});
  }, []);

  function domainFromUrl(url = "") {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  }

  function timeAgo(iso) {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 36e5);
    if (h < 1) {
      const m = Math.max(1, Math.floor(diff / 6e4));
      return `${m} min ago`;
    }
    if (h < 24) return `${h} hours ago`;
    const d = Math.floor(h / 24);
    return `${d} day${d === 1 ? "" : "s"} ago`;
  }

  function normalizedBias(a) {
    const direct = (a.bias || a.sourceBias || a.providerBias || "").toLowerCase();
    if (direct === "left" || direct === "center" || direct === "right") return direct;
    const provider = a.sourceName || a.provider || domainFromUrl(a.url);
    const mapped = (biasMap[provider] || "").toLowerCase();
    if (mapped === "left" || mapped === "center" || mapped === "right") return mapped;
    return "center";
  }

  function biasLabel(b) {
    if (b === "left") return "Lean Left";
    if (b === "right") return "Lean Right";
    return "Center";
  }

  function coarseFromSeven(label) {
    if (!label) return "center";
    const l = String(label).toLowerCase();
    if (l === "center") return "center";
    if (["far-left", "left-leaning", "left-center"].includes(l)) return "left";
    if (["right-center", "right-leaning", "far-right"].includes(l)) return "right";
    return "center";
  }

  const visible = useMemo(() => {
    return (articles || []).filter((a) => !hiddenProviders.has((a.sourceName || a.provider || domainFromUrl(a.url))));
  }, [articles, hiddenProviders]);

  const filtered = useMemo(() => {
    if (tab === "all") return visible;
    return visible.filter((a) => normalizedBias(a) === tab);
  }, [visible, tab, biasMap]);

  function onHidePublisher(provider) {
    setHiddenProviders((prev) => new Set(prev).add(provider));
    setMenuOpen(null);
  }

  function onEditBias(provider) {
    // open vote modal instead of cycling
    setMenuOpen(null);
    setVoteProvider(provider);
    setVoteRating("center");
    setVoteStake(20);
    setVoteError("");
    setVoteOpen(true);
  }

  return (
    <div>
      <div role="tablist" aria-label="Filter sources by bias" className="flex gap-2 border-b mb-3">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm -mb-px border-b-2 ${
              tab === t.key
                ? "border-dark-primary text-dark-primary dark:text-light-primary font-medium"
                : "border-transparent text-secondary-neutral hover:text-dark-primary dark:hover:text-light-primary/90"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.length ? (
          filtered.map((a, idx) => {
            const domain = domainFromUrl(a.url);
            const provider = a.sourceName || a.provider || domain;
            const bias = normalizedBias(a);
            return (
              <li key={idx} className="rounded-lg p-[12px] bg-white text-dark-primary dark:bg-dark-light dark:text-light-primary border border-light-heavy dark:border-dark-light">
                {/* Top bar */}
                <div className="flex bg-light-light dark:bg-dark-light items-center p-[8px] pr-[0.9rem] rounded-lg w-full justify-between">
                  <div className="flex flex-col md:flex-row gap-[8px] md:items-center text-14 w-full md:flex-wrap">
                    {/* Source pill */}
                    <div className="flex flex-col md:flex-row md:items-center gap-[8px] shrink-0">
                      <a target="_blank" rel="noopener noreferrer" className="flex shrink-0" href={a.url}>
                        <div className="flex font-bold bg-light-light dark:bg-tertiary-light dark:text-dark-primary rounded-full px-[0.6rem] py-[5px] gap-[8px] items-center shrink-0">
                          <img alt={provider} width="24" height="24" className="rounded-full object-cover aspect-square" src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`} />
                          <span>{provider}</span>
                        </div>
                      </a>
                    </div>
                    {/* Right controls */}
                    <div className="flex md:ml-auto gap-[8px] flex-wrap md:flex-row-reverse items-center">
                      {/* Bias pill */}
                      <div className="py-[5px] px-[4px] rounded-[4px] text-12 leading-6 flex items-center whitespace-nowrap text-dark-primary bg-secondary-neutral font-bold">
                        {biasLabel(bias)}
                      </div>
                      {/* Factuality */}
                      <button type="button">
                        <div className="py-[5px] px-[4px] rounded-[4px] text-12 leading-6 flex items-center whitespace-nowrap border border-light-heavy dark:border-dark-light">
                          Factuality
                          <LockIcon className="ml-[8px]" />
                        </div>
                      </button>
                      {/* Ownership */}
                      <button type="button">
                        <div className="py-[5px] px-[4px] rounded-[4px] text-12 leading-6 flex items-center whitespace-nowrap border border-light-heavy dark:border-dark-light">
                          Ownership
                          <LockIcon className="ml-[8px]" />
                        </div>
                      </button>
                    </div>
                  </div>
                  {/* Kebab menu */}
                  <div className="relative pt-[6px] ml-2">
                    <button
                      type="button"
                      className="justify-end dark:text-light-primary flex cursor-pointer px-[0.7rem] -mt-[6px] -mr-[0.7rem] w-[1.5rem]"
                      onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen === idx}
                    >
                      <EllipsisV />
                    </button>
                    {menuOpen === idx ? (
                      <div role="menu" className="absolute right-0 mt-2 w-44 rounded-md bg-white dark:bg-dark-light shadow-lg ring-1 ring-black/5 z-10">
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary-light dark:hover:bg-gray-700"
                          onClick={() => onEditBias(provider)}
                        >
                          Edit Bias Rating
                        </button>
                        <button
                          className="w-full text-left px-4 py-2 text-sm hover:bg-tertiary-light dark:hover:bg-gray-700"
                          onClick={() => onHidePublisher(provider)}
                        >
                          Hide Publisher
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Headline & description */}
                <a href={a.url} target="_blank" rel="noopener noreferrer"><h4 className="text-22 leading-9 tablet:font-extrabold mt-3 text-dark-primary dark:text-light-primary">{a.title}</h4></a>
                {a.description ? (
                  <a href={a.url} target="_blank" rel="noopener noreferrer"><p className="font-normal text-18 leading-9 break-words text-dark-primary/80 dark:text-light-primary/90">{a.description}</p></a>
                ) : null}
                <div className="flex justify-between font-normal mt-2 text-secondary-neutral dark:text-light-primary/80">
                  <div className="flex gap-[5px] text-12 whitespace-nowrap"><span><time dateTime={a.publishedAt}>{timeAgo(a.publishedAt)}</time></span></div>
                  <a href={a.url} target="_blank" rel="noopener noreferrer"><span className="underline self-end text-12 text-secondary-neutral hover:text-dark-primary dark:hover:text-light-primary">Read Full Article</span></a>
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-sm text-secondary-neutral">No articles for this bias.</li>
        )}
      </ul>

      {/* Square Vote Modal */}
      {voteOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !voteBusy && setVoteOpen(false)} />
          <div className="relative bg-white dark:bg-dark-light text-dark-primary dark:text-light-primary rounded-lg w-[320px] h-[320px] p-4 shadow-xl border border-light-heavy dark:border-dark-light grid grid-rows-[auto,1fr,auto]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-15">Vote Bias for {voteProvider}</h3>
              <button className="text-secondary-neutral hover:text-dark-primary dark:hover:text-light-primary" onClick={() => !voteBusy && setVoteOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="overflow-auto mt-2">
              <div className="space-y-2">
                <label className="text-12 text-secondary-neutral">Select Bias</label>
                <div className="grid grid-cols-2 gap-2">
                  {RATING_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setVoteRating(opt.key)}
                      className={`px-2 py-2 rounded border text-14 text-left ${voteRating === opt.key ? "border-dark-primary" : "border-light-heavy dark:border-dark-light"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-12 text-secondary-neutral mb-1">Stake ($DUCK) — min 20</label>
                  <input
                    type="number"
                    min={20}
                    step={1}
                    value={voteStake}
                    onChange={(e) => setVoteStake(Number(e.target.value))}
                    className="w-full border border-light-heavy dark:border-dark-light rounded px-2 py-1 bg-white dark:bg-dark-light"
                  />
                </div>
                {voteError ? <p className="text-12 text-red-600">{voteError}</p> : null}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-14 rounded border border-light-heavy dark:border-dark-light" onClick={() => !voteBusy && setVoteOpen(false)} disabled={voteBusy}>Cancel</button>
              <button
                className="px-3 py-2 text-14 rounded bg-dark-primary text-white dark:bg-light-primary dark:text-dark-primary disabled:opacity-60"
                disabled={voteBusy || !(voteStake >= 20)}
                onClick={async () => {
                  if (!(voteStake >= 20)) {
                    setVoteError("Minimum stake is 20 DUCK");
                    return;
                  }
                  setVoteBusy(true);
                  setVoteError("");
                  try {
                    const res = await fetch("/api/bias-votes", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ provider: voteProvider, rating: voteRating, stake: voteStake }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");
                    // Update displayed bias using aggregated label -> coarse (L/C/R)
                    const summary = json?.summary?.[voteProvider];
                    const avgLabel = summary?.averageLabel || "center";
                    const coarse = coarseFromSeven(avgLabel);
                    setBiasMap((m) => ({ ...m, [voteProvider]: coarse }));
                    setVoteOpen(false);
                  } catch (e) {
                    setVoteError(e.message || "Failed to submit vote");
                  } finally {
                    setVoteBusy(false);
                  }
                }}
              >
                {voteBusy ? "Submitting…" : "Submit Vote"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LockIcon({ className = "" }) {
  return (
    <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="lock" className={`svg-inline--fa fa-lock fa-w-14 ${className}`} role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
      <path fill="currentColor" d="M400 192h-32v-46.6C368 65.8 304 .2 224.4 0 144.8-.2 80 64.5 80 144v48H48c-26.5 0-48 21.5-48 48v224c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V240c0-26.5-21.5-48-48-48zm-272-48c0-52.9 43.1-96 96-96s96 43.1 96 96v48H128v-48zm272 320H48V240h352v224z"></path>
    </svg>
  );
}

function EllipsisV() {
  return (
    <svg aria-hidden="true" focusable="false" data-prefix="far" data-icon="ellipsis-v" className="svg-inline--fa fa-ellipsis-v fa-w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 512" width="20" height="20">
      <path fill="currentColor" d="M64 208c26.5 0 48 21.5 48 48s-21.5 48-48 48-48-21.5-48-48 21.5-48 48-48zM16 104c0 26.5 21.5 48 48 48s48-21.5 48-48-21.5-48-48-48-48 21.5-48 48zm0 304c0 26.5 21.5 48 48 48s48-21.5 48-48-21.5-48-48-48-48 21.5-48 48z" />
    </svg>
  );
}
