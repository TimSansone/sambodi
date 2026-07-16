"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { Episode } from "@/lib/types";

const STILL = "https://image.tmdb.org/t/p/w500";

export default function SeasonEpisodes({
  showId,
  seasons
}: {
  showId: number;
  seasons: { season_number: number; episode_count: number; name: string }[];
}) {
  const valid = seasons.filter((season) => season.season_number > 0);
  const [selected, setSelected] = useState(valid[0]?.season_number ?? 1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/shows/${showId}/seasons/${selected}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (!cancelled) setEpisodes(data.episodes ?? []);
      })
      .catch(() => { if (!cancelled) setEpisodes([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [showId, selected]);

  return (
    <section className="panel">
      <div className="seasonHeader">
        <h2>Episodes by Season</h2>
        <select value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
          {valid.map((season) => (
            <option key={season.season_number} value={season.season_number}>
              {season.name} ({season.episode_count} episodes)
            </option>
          ))}
        </select>
      </div>
      {loading ? <div className="status">Loading episodes…</div> : (
        <div className="episodeList">
          {episodes.map((episode) => (
            <article className="episode" key={episode.id}>
              <div className="episodeImage">
                {episode.still_path ? (
                  <Image src={STILL + episode.still_path} alt={episode.name} fill sizes="180px" />
                ) : <span>🎬</span>}
              </div>
              <div>
                <h3>{episode.episode_number}. {episode.name}</h3>
                <p className="meta">{formatDate(episode.air_date)}{episode.runtime ? ` · ${episode.runtime} min` : ""} · ⭐ {(episode.vote_average || 0).toFixed(1)}</p>
                <p>{episode.overview || "No episode summary is available."}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(date: string | null) {
  if (!date) return "Air date not announced";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric"
  });
}
