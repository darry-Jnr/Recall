import type { PageVisit, GroqSearchResult } from "./types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export async function searchWithGroq(
  query: string,
  candidates: PageVisit[]
): Promise<GroqSearchResult[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const systemPrompt = `You are a search ranking assistant. The user is searching through their own browsing history. Given a query and a list of pages they visited, rank the pages by relevance. For each relevant page, provide:
- relevanceScore: a number between 0 and 1 (1 = perfect match)
- summary: a one-sentence explanation of why this page matches the query

Return ONLY a JSON array of objects with fields: url, relevanceScore, summary. Return at most 10 results. If no pages are relevant, return an empty array.`;

  const userPrompt = `Query: "${query}"

Pages:
${candidates
  .map((p, i) => {
    const title = p?.pageTitle || "Untitled";
    const domain = p?.domain || "";
    const desc = p?.metaDescription || (p?.first500Chars || "").slice(0, 150);
    const visited = p?.visitedTime || "";
    return `[${i + 1}] "${title}" (${domain}) — ${desc}... [visited: ${visited}]`;
  })
  .join("\n")}`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "[]";

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  let ranked: { url: string; relevanceScore: number; summary: string }[] = [];
  try {
    ranked = JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }

  return ranked
    .map((r) => {
      const original = candidates.find((c) => c?.url === r?.url);
      if (!original) return null;
      return { ...original, relevanceScore: r.relevanceScore, summary: r.summary };
    })
    .filter(Boolean) as GroqSearchResult[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatWithGroq(
  messages: ChatMessage[],
  candidates: PageVisit[]
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const candidatesFormatted = candidates
    .map((p, i) => {
      const title = p?.pageTitle || "Untitled";
      const domain = p?.domain || "";
      const url = p?.url || "";
      const desc = p?.metaDescription || (p?.first500Chars || "").slice(0, 200);
      const visited = p?.visitedTime || "";
      return `[${i + 1}] Title: "${title}" | URL: ${url} | Domain: ${domain} | Visited: ${visited}\nSummary: ${desc}`;
    })
    .join("\n\n");

  const systemPrompt = `You are Recall, a smart AI browsing memory assistant. You help the user recall and search through their locally stored browsing history.

Below is the list of pages the user has visited:
<browsing_history>
${candidatesFormatted || "No pages recorded yet."}
</browsing_history>

RULES FOR YOUR RESPONSES:
1. Answer the user's questions conversationally, accurately, and naturally based on their browsing history.
2. Whenever you mention or cite a page from their browsing history, ALWAYS format it as a markdown link using its exact URL, like: [Page Title](exact_url_here).
   Example: "Yes! You checked the [Liverpool F.C. Official Site](https://www.liverpoolfc.com) yesterday."
3. If the user asks about a topic, page, or search query that is not found in their browsing history (or if the history list is empty), respond with a polite, warm, and natural message. Clearly and helpfuly state that you couldn't find any matching page visits in their browsing history. Do not hallucinate or make up visits. You can offer a helpful suggestion, such as what else they might search for or asking if they'd like to try rephrasing their request.
4. Keep responses clear, friendly, and helpful.`;

  const apiMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: apiMessages,
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "I couldn't generate a response.";
}

