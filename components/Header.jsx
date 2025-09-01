"use client";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const interests = [
  "Artificial Intelligence",
  "Soccer",
  "Israel-Gaza",
  "US Open",
  "Volleyball",
  "Donald Trump",
];

export default function Header() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <header className="w-full border-b border-gray-200/80 bg-white/80 backdrop-blur">
      {/* Utility strip */}
      <div className="container-max text-sm flex items-center justify-between py-2">
        <div className="flex items-center gap-4">
          <Link href="/extension" className="text-gray-600 hover:text-gray-900">
            Browser Extension
          </Link>
          <div className="hidden md:flex items-center gap-2 text-gray-600">
            <span>Theme:</span>
            <button className="hover:text-gray-900">Light</button>
            <button className="hover:text-gray-900">Dark</button>
            <button className="hover:text-gray-900">Auto</button>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <button className="hover:text-gray-900">Set Location</button>
          <span className="hidden md:inline">International Edition</span>
        </div>
      </div>

      {/* Primary nav */}
      <div className="container-max py-3 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/duck-wire-logo.png" alt="DuckWire" className="h-8 w-auto" />
          <span className="sr-only">DuckWire Home</span>
        </Link>
        <nav className="flex items-center gap-4 text-[15px]">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/my" className="hover:underline">For You</Link>
          <Link href="/local" className="hover:underline">Local</Link>
          <Link href="/blindspot" className="hover:underline">Blindspot</Link>
          <Link href="/clusters" className="hover:underline">Clusters</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <form
            onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }}
            className="hidden md:flex items-center gap-2 border rounded-md px-2 py-1 bg-white"
            role="search"
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search stories, topics, sources"
              className="outline-none text-sm w-64"
              aria-label="Search"
            />
          </form>
          <Link href="/subscribe" className="px-3 py-2 rounded-md bg-brand-accent1/80 hover:bg-brand-accent1 text-gray-900 font-semibold">
            Subscribe
          </Link>
          <div className="ml-1">
            <ConnectButton label="Connect Wallet" chainStatus="icon" showBalance={false} />
          </div>
        </div>
      </div>

      {/* Interest pills scroller */}
      <div className="border-t border-gray-200/80">
        <div className="container-max py-2 overflow-x-auto flex gap-2">
          {interests.map((it) => (
            <button key={it} className="shrink-0 px-3 py-1 rounded-full border text-sm hover:bg-gray-50">
              {it}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
