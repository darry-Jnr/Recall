import { NextRequest } from "next/server";
import { chatWithGroq, type ChatMessage } from "@/lib/groq";
import type { PageVisit } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { messages, candidates } = (await request.json()) as {
      messages: ChatMessage[];
      candidates: PageVisit[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Missing or invalid messages array" }, { status: 400 });
    }

    const responseContent = await chatWithGroq(messages, Array.isArray(candidates) ? candidates : []);
    return Response.json({ response: responseContent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
