"use client";

import { useEffect, useState } from "react";
import type { ShowSummary } from "@/lib/types";

const KEY = "streamScoutNextWatchlist";

export function getWatchlist(): ShowSummary[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); }
  catch { return []; }
}

export default function WatchlistButton({ show }: { show: ShowSummary }) {
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    setFollowing(getWatchlist().some((item) => item.id === show.id));
  }, [show.id]);

  function toggle() {
    const current = getWatchlist();
    const next = current.some((item) => item.id === show.id)
      ? current.filter((item) => item.id !== show.id)
      : [...current, show];
    localStorage.setItem(KEY, JSON.stringify(next));
    setFollowing(next.some((item) => item.id === show.id));
    window.dispatchEvent(new Event("stream-scout-watchlist"));
  }

  return (
    <button className={`button ${following ? "activeButton" : ""}`} onClick={toggle}>
      {following ? "✓ Following" : "＋ Follow"}
    </button>
  );
}
