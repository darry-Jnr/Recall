import type { GroqSearchResult } from "@/lib/types";

interface SearchResultsProps {
  results: GroqSearchResult[];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString();
}

export function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <p className="text-text-muted text-sm mt-8 text-center">
        No matching pages found.
      </p>
    );
  }

  return (
    <div className="w-full max-w-[584px] mt-6 space-y-1">
      {results.map((r) => (
        <a
          key={r.url}
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl hover:bg-surface-2 transition-colors group"
        >
          <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
            <span>{r.domain}</span>
            <span>·</span>
            <span>{formatTime(r.visitedTime)}</span>
            {r.timeSpentSec > 0 && (
              <>
                <span>·</span>
                <span>{r.timeSpentSec}s spent</span>
              </>
            )}
          </div>
          <h3 className="text-[15px] text-accent group-hover:underline truncate mb-1">
            {r.pageTitle || r.url}
          </h3>
          <p className="text-sm text-text-secondary line-clamp-2">
            {r.summary}
          </p>
        </a>
      ))}
    </div>
  );
}
