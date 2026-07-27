import type { PageVisit, GroqSearchResult, ClassifiedPage } from "./types";

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
3. When mentioning dates or visit times, ALWAYS format them as Mon-DD-YYYY at HH:MM AM/PM (e.g., Jul-27-2026 at 07:29 AM, Feb-12-2026 at 03:15 PM). Never show raw ISO timestamps like 2026-07-27T07:29:10.944Z. Wrap the time portion in italic like: *Jul-27-2026 at 07:29 AM*.
4. If the user asks about a topic, page, or search query that is not found in their browsing history (or if the history list is empty), respond with a polite, warm, and natural message. Clearly and helpfuly state that you couldn't find any matching page visits in their browsing history. Do not hallucinate or make up visits. You can offer a helpful suggestion, such as what else they might search for or asking if they'd like to try rephrasing their request.
5. Keep responses clear, friendly, and helpful.`;

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

export async function classifyPagesForDeletion(
  query: string,
  pages: PageVisit[]
): Promise<ClassifiedPage[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const pagesFormatted = pages
    .map((p, i) => {
      const title = p?.pageTitle || "Untitled";
      const domain = p?.domain || "";
      const url = p?.url || "";
      const desc = p?.metaDescription || (p?.first500Chars || "").slice(0, 200);
      const keywords = p?.keywords?.join(", ") || "";
      return `[${i + 1}] Title: "${title}" | URL: ${url} | Domain: ${domain} | Keywords: ${keywords}\nDescription: ${desc}`;
    })
    .join("\n\n");

  const systemPrompt = `You are a content classifier for a browser history management tool. Given the user's deletion request and a list of visited pages, identify which pages match the user's criteria for deletion.

RULES:
1. Analyze each page's title, domain, description, and keywords to determine if it matches the user's request.
2. Be accurate — only include pages that clearly match the criteria.
3. Return ONLY a JSON array of objects with fields: url, pageTitle, domain, reason.
4. The "reason" field should be a short explanation of why this page matches the deletion criteria.
5. If no pages match, return an empty array [].
6. Do NOT include pages that don't match. Be conservative — don't delete pages that might be relevant to the user.`;

  const userPrompt = `User's deletion request: "${query}"

Pages to evaluate:
${pagesFormatted || "No pages available."}

Return a JSON array of pages that match the deletion criteria.`;

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
      max_tokens: 2048,
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

  try {
    const classified = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(classified)) return [];
    return classified.filter(
      (c) => c.url && c.pageTitle && c.domain && c.reason
    );
  } catch {
    return [];
  }
}

