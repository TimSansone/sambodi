"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ShowCard from "./ShowCard";
import type { ShowSummary } from "@/lib/types";

export default function DiscoverClient() {
  const [shows, setShows] = useState<ShowSummary[]>([]);
  const [mode, setMode] = useState<"popular" | "trending">("popular");
  const [provider, setProvider] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDiscover(nextMode = mode) {
    setLoading(true); setError("");
    try {
      const pages = await Promise.all(
        [1,2,3,4,5].map(async (page) => {
          const response = await fetch(`/api/discover?type=${nextMode}&page=${page}`);
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Unable to load shows.");
          return data.results as ShowSummary[];
        })
      );
      setShows(pages.flat().map((show, index) => ({ ...show, rank: index + 1 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load shows.");
    } finally { setLoading(false); }
  }

  useEffect(() => { loadDiscover(mode); }, [mode]);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Search failed.");
      setShows((data.results as ShowSummary[]).map((show, index) => ({ ...show, rank: index + 1 })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed.");
    } finally { setLoading(false); }
  }

  const providers = useMemo(() => {
    const map = new Map<number, string>();
    shows.forEach((show) => show.providers?.stream?.forEach((item) => map.set(item.id, item.name)));
    return [...map.entries()].sort((a,b) => a[1].localeCompare(b[1]));
  }, [shows]);

  const filtered = provider
    ? shows.filter((show) => show.providers?.stream?.some((item) => String(item.id) === provider))
    : shows;

  return (
    <>
      <section className="hero">
        <div>
          <h1>See what everyone is watching.</h1>
          <p>Browse popular and trending shows, view full season and episode details, and build your personal watchlist.</p>
          <form className="searchForm" onSubmit={search}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search for any TV or streaming show" />
            <button className="button primaryButton">Search</button>
          </form>
        </div>
        <div className="heroArt">📺✨</div>
      </section>

      <section className="toolbar">
        <div className="tabs">
          <button className={`button ${mode === "popular" ? "activeButton" : ""}`} onClick={() => setMode("popular")}>Top 100 Popular</button>
          <button className={`button ${mode === "trending" ? "activeButton" : ""}`} onClick={() => setMode("trending")}>Trending This Week</button>
        </div>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          <option value="">All Streaming Platforms</option>
          {providers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
        </select>
      </section>

      {loading && <div className="status">Loading shows and streaming platforms…</div>}
      {error && <div className="status error">{error}</div>}
      {!loading && !error && (
        <div className="showGrid">{filtered.map((show) => <ShowCard key={show.id} show={show} />)}</div>
      )}
      <p className="attribution">Streaming availability data provided by JustWatch through TMDb. U.S. availability may change.</p>
    </>
  );
}
