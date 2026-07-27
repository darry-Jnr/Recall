"use client";

import type { PageVisit } from "@/lib/types";

interface AnalyticsModalProps {
  pages: PageVisit[];
  onClose: () => void;
}

export function AnalyticsModal({ pages, onClose }: AnalyticsModalProps) {
  const totalPages = pages.length;
  const uniqueDomains = new Set(pages.map((p) => p.domain)).size;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 h-16 border-b border-divider">
        <span className="font-[var(--font-heading)] text-lg font-extrabold tracking-[0.15em] uppercase">
          RECALL
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-all duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>
      </div>

      {/* Content centered */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent/20 to-lilac/30 flex items-center justify-center mx-auto mb-6 border border-accent/20 shadow-inner">
            <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2 tracking-tight">
            This is your analytics
          </h1>
          <p className="text-text-secondary text-sm mb-8">
            Your browsing activity at a glance.
          </p>

          <div className="flex gap-4 justify-center">
            <div className="px-6 py-4 rounded-2xl bg-surface-2 border border-divider">
              <p className="text-3xl font-bold text-accent">{totalPages}</p>
              <p className="text-xs text-text-muted mt-1">Pages Tracked</p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-surface-2 border border-divider">
              <p className="text-3xl font-bold text-lilac">{uniqueDomains}</p>
              <p className="text-xs text-text-muted mt-1">Unique Domains</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
