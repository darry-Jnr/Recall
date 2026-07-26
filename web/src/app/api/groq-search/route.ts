import { NextRequest } from "next/server";
import { searchWithGroq } from "@/lib/groq";
import type { PageVisit } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { query, candidates } = (await request.json()) as {
      query: string;
      candidates: PageVisit[];
    };

    if (!query || !Array.isArray(candidates)) {
      return Response.json({ error: "Missing query or candidates" }, { status: 400 });
    }

    const results = await searchWithGroq(query, candidates);
    return Response.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
