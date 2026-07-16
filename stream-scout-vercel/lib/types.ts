export type Provider = {
  id: number;
  name: string;
  logo: string | null;
  type?: string;
};

export type Providers = {
  stream: Provider[];
  rent: Provider[];
  buy: Provider[];
  link: string | null;
};

export type ShowSummary = {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  original_language: string;
  providers?: Providers;
  rank?: number;
};

export type Episode = {
  id: number;
  name: string;
  overview: string;
  air_date: string | null;
  episode_number: number;
  season_number: number;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
};

export type ShowDetails = ShowSummary & {
  tagline: string;
  status: string;
  number_of_seasons: number;
  number_of_episodes: number;
  last_air_date: string;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  created_by: { id: number; name: string }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  seasons: {
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
    poster_path: string | null;
  }[];
  next_episode_to_air: Episode | null;
  last_episode_to_air: Episode | null;
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
  recommendations?: { results: ShowSummary[] };
  content_ratings?: { results: { iso_3166_1: string; rating: string }[] };
};
