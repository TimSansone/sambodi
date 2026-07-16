import Image from "next/image";
import Link from "next/link";
import type { ShowSummary } from "@/lib/types";
import WatchlistButton from "./WatchlistButton";

const IMG = "https://image.tmdb.org/t/p/w500";
const LOGO = "https://image.tmdb.org/t/p/w92";

export default function ShowCard({ show }: { show: ShowSummary }) {
  return (
    <article className="showCard">
      <Link className="posterLink" href={`/shows/${show.id}`}>
        <div className="poster">
          {show.poster_path ? (
            <Image src={IMG + show.poster_path} alt={show.name} fill sizes="(max-width: 600px) 45vw, 250px" />
          ) : <span className="posterFallback">📺</span>}
          {show.rank && <span className="rank">#{show.rank}</span>}
          <span className="rating">⭐ {(show.vote_average || 0).toFixed(1)}</span>
        </div>
      </Link>
      <div className="cardBody">
        <Link className="showTitle" href={`/shows/${show.id}`}>{show.name}</Link>
        <p className="meta">{show.first_air_date?.slice(0, 4) || "Year unknown"}</p>
        <p className="cardOverview">{show.overview || "No description available."}</p>
        <div className="providerLogos">
          {(show.providers?.stream ?? []).slice(0, 5).map((provider) =>
            provider.logo ? (
              <Image key={provider.id} src={LOGO + provider.logo} alt={provider.name} title={provider.name} width={32} height={32} />
            ) : null
          )}
          {!show.providers?.stream?.length && <small>No subscription provider listed</small>}
        </div>
        <div className="cardButtons">
          <Link className="button" href={`/shows/${show.id}`}>More Info</Link>
          <WatchlistButton show={show} />
        </div>
      </div>
    </article>
  );
}
