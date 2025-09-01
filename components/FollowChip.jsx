"use client";
import { useState, useEffect } from "react";

export default function FollowChip({ label = "Follow", initial = false, onChange }) {
  const [on, setOn] = useState(initial);

  useEffect(() => { onChange?.(on); }, [on, onChange]);

  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className={`px-3 py-1 rounded-full border text-sm transition ${on ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"}`}
      aria-pressed={on}
    >
      {on ? "Following" : label}
    </button>
  );
}
