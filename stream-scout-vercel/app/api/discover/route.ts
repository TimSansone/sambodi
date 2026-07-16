import { NextRequest } from "next/server";
import { normalizeProviders, tmdb } from "@/lib/tmdb";
import type { ShowSummary } from "@/lib/types";

type ListResponse = { page: number; total_pages: number; results: ShowSummary[] };

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type") === "trending" ? "trending" : "popular";
    const page = Math.min(Math.max(Number(request.nextUrl.searchParams.get("page")) || 1, 1), 5);
    const path = type === "trending" ? "/trending/tv/week" : "/tv/popular";
    const data = await tmdb<ListResponse>(path, { language: "en-US", page });

    const results = await Promise.all(data.results.map(async (show) => {
      try {
        const raw = await tmdb<{ results?: Record<string, unknown> }>(
          `/tv/${show.id}/watch/providers`, {}, 3600
        );
        return { ...show, providers: normalizeProviders(raw, "US") };
      } catch {
        return { ...show, providers: { stream: [], rent: [], buy: [], link: null } };
      }
    }));

    return Response.json({ ...data, results });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load shows." },
      { status: 500 }
    );
  }
}
