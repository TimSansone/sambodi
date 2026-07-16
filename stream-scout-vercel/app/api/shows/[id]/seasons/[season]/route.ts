import { tmdb } from "@/lib/tmdb";
import type { Episode } from "@/lib/types";

type SeasonResponse = {
  id: number;
  name: string;
  season_number: number;
  overview: string;
  episodes: Episode[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  try {
    const { id, season } = await params;
    const data = await tmdb<SeasonResponse>(
      `/tv/${id}/season/${season}`,
      { language: "en-US" }
    );
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to load season." },
      { status: 500 }
    );
  }
}
