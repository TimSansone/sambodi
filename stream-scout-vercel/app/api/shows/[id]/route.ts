import { normalizeProviders, tmdb } from "@/lib/tmdb";
import type { ShowDetails } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const details = await tmdb<ShowDetails>(`/tv/${id}`, {
      language: "en-US",
      append_to_response: "videos,credits,recommendations,content_ratings"
    });
    const raw = await tmdb<{ results?: Record<string, unknown> }>(
      `/tv/${id}/watch/providers`, {}, 3600
    ).catch(() => ({ results: {} }));

    return Response.json({ ...details, providers: normalizeProviders(raw, "US") });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load show." },
      { status: 500 }
    );
  }
}
