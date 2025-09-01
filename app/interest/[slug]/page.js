"use client";
import { useEffect, useState } from "react";

const RATING_OPTIONS = [
  { key: "far-left", label: "Far Left" },
  { key: "left-leaning", label: "Left-leaning" },
  { key: "left-center", label: "Left-center" },
  { key: "center", label: "Center" },
  { key: "right-center", label: "Right-center" },
  { key: "right-leaning", label: "Right-leaning" },
  { key: "far-right", label: "Far Right" },
];

export default function InterestPage({ params }) {
  const provider = decodeURIComponent(params?.slug || "");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [voteOpen, setVoteOpen] = useState(false);
  const [voteRating, setVoteRating] = useState("center");
  const [voteStake, setVoteStake] = useState(20);
  const [voteBusy, setVoteBusy] = useState(false);
  const [voteError, setVoteError] = useState("");

  async function load() {
    if (!provider) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bias-votes?provider=${encodeURIComponent(provider)}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setSummary(json?.summary?.[provider] || null);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Bias for {provider}</h1>
        <button
          className="px-3 py-2 text-14 rounded bg-dark-primary text-white dark:bg-light-primary dark:text-dark-primary"
          onClick={() => {
            setVoteRating("center");
            setVoteStake(20);
            setVoteError("");
            setVoteOpen(true);
          }}
        >
          Vote Bias
        </button>
      </div>

      {loading ? <p className="text-secondary-neutral">Loading…</p> : null}
      {error ? <p className="text-red-600">{error}</p> : null}

      {summary ? (
        <div className="rounded-lg border border-light-heavy dark:border-dark-light p-4 bg-white dark:bg-dark-light">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-12 text-secondary-neutral">Average Label</p>
              <p className="text-lg font-medium">{summary.averageLabel}</p>
            </div>
            <div>
              <p className="text-12 text-secondary-neutral">Average Score</p>
              <p className="text-lg font-medium">{summary.averageScore?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-12 text-secondary-neutral">Total Stake ($DUCK)</p>
              <p className="text-lg font-medium">{summary.totalStake}</p>
            </div>
            <div>
              <p className="text-12 text-secondary-neutral">Voters</p>
              <p className="text-lg font-medium">{summary.voters}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-12 text-secondary-neutral mb-2">Vote Distribution</p>
            <ul className="grid grid-cols-2 gap-2">
              {Object.entries(summary.counts || {}).map(([k, v]) => (
                <li key={k} className="flex items-center justify-between text-14">
                  <span className="capitalize">{k.replace("-", " ")}</span>
                  <span className="text-secondary-neutral">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        !loading && <p className="text-secondary-neutral">No votes yet. Be the first to vote.</p>
      )}

      {/* Square Vote Modal */}
      {voteOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !voteBusy && setVoteOpen(false)} />
          <div className="relative bg-white dark:bg-dark-light text-dark-primary dark:text-light-primary rounded-lg w-[320px] h-[320px] p-4 shadow-xl border border-light-heavy dark:border-dark-light grid grid-rows-[auto,1fr,auto]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-15">Vote Bias for {provider}</h3>
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
                      body: JSON.stringify({ provider, rating: voteRating, stake: voteStake }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");
                    setVoteOpen(false);
                    await load();
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
