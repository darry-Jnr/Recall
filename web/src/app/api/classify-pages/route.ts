import { NextRequest } from "next/server";
import { classifyPagesForDeletion } from "@/lib/groq";
import type { PageVisit } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { query, pages } = (await request.json()) as {
      query: string;
      pages: PageVisit[];
    };

    if (!query || typeof query !== "string") {
      return Response.json({ error: "Missing or invalid query" }, { status: 400 });
    }

    if (!Array.isArray(pages) || pages.length === 0) {
      return Response.json({ matches: [], query });
    }

    const matches = await classifyPagesForDeletion(query, pages);
    return Response.json({ matches, query });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
