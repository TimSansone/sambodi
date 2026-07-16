import { NextRequest } from "next/server";
import { normalizeProviders, tmdb } from "@/lib/tmdb";
import type { ShowSummary } from "@/lib/types";

type SearchResponse = { results: ShowSummary[] };

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();
    if (!query) return Response.json({ error: "Search text is required." }, { status: 400 });

    const data = await tmdb<SearchResponse>("/search/tv", {
      query, include_adult: false, language: "en-US", page: 1
    }, 300);

    const results = await Promise.all(data.results.slice(0, 20).map(async (show) => {
      try {
        const raw = await tmdb<{ results?: Record<string, unknown> }>(
          `/tv/${show.id}/watch/providers`, {}, 3600
        );
        return { ...show, providers: normalizeProviders(raw, "US") };
      } catch {
        return { ...show, providers: { stream: [], rent: [], buy: [], link: null } };
      }
    }));

    return Response.json({ results });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Search failed." },
      { status: 500 }
    );
  }
}
