import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeasonEpisodes from "@/components/SeasonEpisodes";
import WatchlistButton from "@/components/WatchlistButton";
import type { ShowDetails } from "@/lib/types";

const IMG = "https://image.tmdb.org/t/p/w500";
const BACK = "https://image.tmdb.org/t/p/original";
const PROFILE = "https://image.tmdb.org/t/p/w185";
const LOGO = "https://image.tmdb.org/t/p/w92";

async function getShow(id: string): Promise<ShowDetails | null> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const response = await fetch(`${base}/api/shows/${id}`, { next: { revalidate: 1800 } });
  if (!response.ok) return null;
  return response.json();
}

export default async function ShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const show = await getShow(id);
  if (!show) notFound();

  const certification = show.content_ratings?.results.find((item) => item.iso_3166_1 === "US")?.rating || "Not rated";
  const trailer = show.videos?.results.find((video) => video.site === "YouTube" && video.type === "Trailer" && video.official)
    ?? show.videos?.results.find((video) => video.site === "YouTube" && video.type === "Trailer");
  const cast = show.credits?.cast.slice(0, 10) ?? [];
  const recommendations = show.recommendations?.results.slice(0, 12) ?? [];
  const episode = show.next_episode_to_air ?? show.last_episode_to_air;
  const episodeHeading = show.next_episode_to_air ? "Next Episode" : "Latest Episode";

  return (
    <article>
      <section className="detailHero" style={{
        backgroundImage: show.backdrop_path ? `url(${BACK}${show.backdrop_path})` : undefined
      }}>
        <div className="detailShade" />
        <div className="detailHeroContent">
          {show.poster_path && <Image className="detailPoster" src={IMG + show.poster_path} alt={show.name} width={240} height={360} priority />}
          <div>
            <Link className="backLink" href="/">← Back to Discover</Link>
            <h1>{show.name}</h1>
            {show.tagline && <p className="tagline">{show.tagline}</p>}
            <div className="pills">
              <span>⭐ {(show.vote_average || 0).toFixed(1)}</span>
              <span>{certification}</span>
              <span>{show.number_of_seasons} season{show.number_of_seasons === 1 ? "" : "s"}</span>
              <span>{show.status}</span>
              {show.genres.map((genre) => <span key={genre.id}>{genre.name}</span>)}
            </div>
            <p className="detailOverview">{show.overview || "No description is available."}</p>
            <WatchlistButton show={show} />
          </div>
        </div>
      </section>

      <div className="detailContent">
        <div className="detailColumns">
          <div>
            <section className="panel nextEpisode">
              <h2>{episodeHeading}</h2>
              {episode ? (
                <>
                  <h3>S{episode.season_number} E{episode.episode_number}: {episode.name}</h3>
                  <p className="meta">{formatDate(episode.air_date)}{episode.runtime ? ` · ${episode.runtime} minutes` : ""}</p>
                  <p>{episode.overview || "No episode summary is available."}</p>
                </>
              ) : <p>No episode information is currently available.</p>}
            </section>

            <section className="panel">
              <h2>Main Cast</h2>
              <div className="castRow">
                {cast.map((person) => (
                  <div className="castCard" key={person.id}>
                    {person.profile_path ? <Image src={PROFILE + person.profile_path} alt={person.name} width={90} height={115} /> : <div className="personFallback">👤</div>}
                    <strong>{person.name}</strong><small>{person.character}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="panel">
            <h2>Show Facts</h2>
            <div className="facts">
              <Fact label="First aired" value={formatDate(show.first_air_date)} />
              <Fact label="Last aired" value={formatDate(show.last_air_date)} />
              <Fact label="Episodes" value={String(show.number_of_episodes)} />
              <Fact label="Runtime" value={`${show.episode_run_time?.[0] ?? "—"} min`} />
              <Fact label="Created by" value={show.created_by.map((item) => item.name).join(", ") || "Not listed"} />
              <Fact label="Network/platform" value={show.networks.map((item) => item.name).join(", ") || "Not listed"} />
            </div>
            <h3>Streaming in the U.S.</h3>
            <div className="providerLogos large">
              {show.providers?.stream?.map((provider) => provider.logo ? (
                <Image key={provider.id} src={LOGO + provider.logo} alt={provider.name} title={provider.name} width={38} height={38} />
              ) : null)}
            </div>
            {show.providers?.link && <a className="button watchLink" href={show.providers.link} target="_blank" rel="noreferrer">Where to Watch</a>}
          </aside>
        </div>

        {trailer && (
          <section className="panel">
            <h2>Official Trailer</h2>
            <iframe className="trailer" src={`https://www.youtube.com/embed/${trailer.key}`} title={`${show.name} trailer`} allowFullScreen />
          </section>
        )}

        <SeasonEpisodes showId={show.id} seasons={show.seasons} />

        {recommendations.length > 0 && (
          <section className="panel">
            <h2>You May Also Like</h2>
            <div className="recommendations">
              {recommendations.map((item) => (
                <Link key={item.id} href={`/shows/${item.id}`}>
                  {item.poster_path && <Image src={IMG + item.poster_path} alt={item.name} width={150} height={225} />}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return <div className="fact"><small>{label}</small><strong>{value}</strong></div>;
}

function formatDate(date?: string | null) {
  if (!date) return "Not announced";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  });
}
