const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdb(path, params = {}) {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) throw new Error("TMDB_API_TOKEN is not configured.");

  const url = new URL(TMDB_BASE + path);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json"
    }
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`TMDB request failed (${response.status}): ${detail.slice(0, 200)}`);
  }
  return response.json();
}

function normalizeProviders(payload, region = "US") {
  const country = payload?.results?.[region] || {};
  const subscription = country.flatrate || [];
  const free = country.free || [];
  const ads = country.ads || [];
  const rent = country.rent || [];
  const buy = country.buy || [];

  const unique = new Map();
  [...subscription, ...free, ...ads].forEach(provider => {
    unique.set(provider.provider_id, {
      id: provider.provider_id,
      name: provider.provider_name,
      logo: provider.logo_path,
      type: subscription.some(p => p.provider_id === provider.provider_id)
        ? "subscription"
        : free.some(p => p.provider_id === provider.provider_id)
          ? "free"
          : "ads"
    });
  });

  return {
    stream: [...unique.values()],
    rent: rent.map(p => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path })),
    buy: buy.map(p => ({ id: p.provider_id, name: p.provider_name, logo: p.logo_path })),
    link: country.link || null
  };
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=86400");

  try {
    const action = req.query.action || "popular";
    const region = (req.query.region || "US").toUpperCase();

    if (action === "popular" || action === "trending") {
      const page = Math.min(Math.max(Number(req.query.page) || 1, 1), 5);
      const path = action === "trending" ? "/trending/tv/week" : "/tv/popular";
      const data = await tmdb(path, { language: "en-US", page });

      const shows = await Promise.all(
        (data.results || []).map(async show => {
          try {
            const providers = await tmdb(`/tv/${show.id}/watch/providers`);
            return { ...show, providers: normalizeProviders(providers, region) };
          } catch {
            return { ...show, providers: { stream: [], rent: [], buy: [], link: null } };
          }
        })
      );

      return res.status(200).json({
        page: data.page,
        total_pages: data.total_pages,
        results: shows
      });
    }

    if (action === "search") {
      const query = String(req.query.q || "").trim();
      if (!query) return res.status(400).json({ error: "A search query is required." });
      const data = await tmdb("/search/tv", {
        query,
        include_adult: false,
        language: "en-US",
        page: 1
      });
      return res.status(200).json(data);
    }

    if (action === "providers") {
      const id = Number(req.query.id);
      if (!id) return res.status(400).json({ error: "A TV series id is required." });
      const data = await tmdb(`/tv/${id}/watch/providers`);
      return res.status(200).json(normalizeProviders(data, region));
    }

    return res.status(400).json({ error: "Unsupported action." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
}
