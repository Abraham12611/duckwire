"use client";
import { useState } from "react";

export default function ClusterSummaryTabs({ left = [], center = [], right = [] }) {
  const [tab, setTab] = useState("center");
  const tabs = [
    { key: "left", label: "Left" },
    { key: "center", label: "Center" },
    { key: "right", label: "Right" },
  ];
  const bullets = tab === "left" ? left : tab === "right" ? right : center;

  return (
    <div className="w-full">
      <div role="tablist" aria-label="Bias summary" className="flex gap-2 border-b">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm -mb-px border-b-2 ${tab === t.key ? "border-gray-900 font-medium" : "border-transparent text-gray-600"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {bullets && bullets.length ? (
          <ul className="list-disc list-inside text-sm space-y-1">
            {bullets.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No bullets</p>
        )}
        <div className="mt-3 text-xs text-gray-500">Insights by DuckWire AI</div>
      </div>
    </div>
  );
}
