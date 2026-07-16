"use client";

import { useEffect, useState } from "react";
import ShowCard from "./ShowCard";
import { getWatchlist } from "./WatchlistButton";
import type { ShowSummary } from "@/lib/types";

export default function MyShowsClient() {
  const [shows, setShows] = useState<ShowSummary[]>([]);

  useEffect(() => {
    const refresh = () => setShows(getWatchlist());
    refresh();
    window.addEventListener("stream-scout-watchlist", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("stream-scout-watchlist", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <section>
      <div className="pageHeading">
        <div><h1>My Shows</h1><p>Your followed shows are stored in this browser.</p></div>
        {shows.length > 0 && (
          <button className="button" onClick={() => {
            localStorage.removeItem("streamScoutNextWatchlist");
            setShows([]);
          }}>Clear Watchlist</button>
        )}
      </div>
      {shows.length ? (
        <div className="showGrid">{shows.map((show) => <ShowCard key={show.id} show={show} />)}</div>
      ) : <div className="status">You are not following any shows yet.</div>}
    </section>
  );
}
