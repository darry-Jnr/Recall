"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  searching: boolean;
}

export function SearchBar({ onSearch, searching }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = query.trim();
      if (trimmed) onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[584px]">
      <div className="flex items-center h-14 rounded-full bg-surface-2 border border-divider focus-within:border-text-muted transition-colors px-5 gap-3">
        <svg className="w-5 h-5 text-text-muted shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search your browsing history..."
          className="flex-1 bg-transparent text-[15px] text-text-primary placeholder:text-text-muted outline-none"
          autoFocus
        />
        {searching && (
          <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </form>
  );
}
