import type { Providers } from "./types";

const BASE = "https://api.themoviedb.org/3";

export async function tmdb<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
  revalidate = 1800
): Promise<T> {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error("TMDB_API_TOKEN is not configured.");

  const url = new URL(BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
    next: { revalidate }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`TMDb request failed (${response.status}): ${text.slice(0, 180)}`);
  }

  return response.json() as Promise<T>;
}

export function normalizeProviders(
  payload: { results?: Record<string, any> },
  region = "US"
): Providers {
  const country = payload.results?.[region] ?? {};
  const subscription = country.flatrate ?? [];
  const free = country.free ?? [];
  const ads = country.ads ?? [];
  const map = new Map<number, any>();

  [...subscription, ...free, ...ads].forEach((provider) => {
    map.set(provider.provider_id, {
      id: provider.provider_id,
      name: provider.provider_name,
      logo: provider.logo_path,
      type: subscription.some((p: any) => p.provider_id === provider.provider_id)
        ? "subscription"
        : free.some((p: any) => p.provider_id === provider.provider_id)
          ? "free"
          : "ads"
    });
  });

  return {
    stream: [...map.values()],
    rent: (country.rent ?? []).map((p: any) => ({
      id: p.provider_id, name: p.provider_name, logo: p.logo_path
    })),
    buy: (country.buy ?? []).map((p: any) => ({
      id: p.provider_id, name: p.provider_name, logo: p.logo_path
    })),
    link: country.link ?? null
  };
}
