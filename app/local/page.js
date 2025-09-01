"use client";
import { useState } from "react";

export default function LocalPage() {
  const [city, setCity] = useState("");
  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold mb-2">Daily Local News</h1>
      <div className="flex gap-2">
        <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="Enter your city" className="border rounded px-3 py-2 flex-1" />
        <button className="px-4 py-2 rounded bg-black text-white">Set Location</button>
      </div>
      <div className="mt-4 space-y-2">
        <div className="text-sm text-gray-600">Local stories will appear here.</div>
      </div>
    </div>
  );
}
