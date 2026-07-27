"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { PageVisit } from "@/lib/types";

interface AnalyticsModalProps {
  pages: PageVisit[];
  onClose: () => void;
}

type ChartView = "activity" | "domains";
type DateFilter = "today" | "yesterday" | "7days" | "all";

const PIE_COLORS = [
  "#3A7BFD",
  "#9D7BFF",
  "#3A7BFD99",
  "#9D7BFF99",
  "#5B9BFD",
  "#B49AFF",
  "#7BABFF",
  "#C4AAFF",
];

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7days", label: "Last 7 Days" },
  { key: "all", label: "All Time" },
];

function filterByDate(pages: PageVisit[], filter: DateFilter): PageVisit[] {
  if (filter === "all") return pages;
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (filter === "today") {
    return pages.filter((p) => new Date(p.visitedTime) >= startOfDay);
  }
  if (filter === "yesterday") {
    const yesterdayStart = new Date(startOfDay);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(startOfDay);
    return pages.filter((p) => {
      const t = new Date(p.visitedTime);
      return t >= yesterdayStart && t < yesterdayEnd;
    });
  }
  if (filter === "7days") {
    const weekAgo = new Date(startOfDay);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return pages.filter((p) => new Date(p.visitedTime) >= weekAgo);
  }
  return pages;
}

function processHourlyData(pages: PageVisit[]) {
  const hourCounts: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourCounts[h] = 0;

  pages.forEach((p) => {
    if (!p.visitedTime) return;
    const hour = new Date(p.visitedTime).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: `${Number(hour)}:00`,
    pages: count,
  }));
}

function processDomainData(pages: PageVisit[]) {
  const sorted = [...pages].sort(
    (a, b) => new Date(a.visitedTime).getTime() - new Date(b.visitedTime).getTime()
  );

  const domainMinutes: Record<string, number> = {};

  for (let i = 0; i < sorted.length; i++) {
    const domain = sorted[i].domain || "unknown";
    let elapsed = 0;

    if (i < sorted.length - 1) {
      const diff =
        new Date(sorted[i + 1].visitedTime).getTime() -
        new Date(sorted[i].visitedTime).getTime();
      elapsed = Math.min(diff / 60000, 30);
    } else {
      elapsed = 2;
    }

    domainMinutes[domain] = (domainMinutes[domain] || 0) + elapsed;
  }

  const sortedDomains = Object.entries(domainMinutes)
    .sort((a, b) => b[1] - a[1]);

  const top = sortedDomains.slice(0, 7);
  const otherMinutes = sortedDomains.slice(7).reduce((sum, [, m]) => sum + m, 0);

  const result = top.map(([name, minutes]) => ({
    name,
    minutes: Math.round(minutes * 10) / 10,
  }));
  if (otherMinutes > 0) {
    result.push({ name: "Other", minutes: Math.round(otherMinutes * 10) / 10 });
  }
  return result;
}

function formatMinutes(m: number): string {
  if (m < 1) return `${Math.round(m * 60)}s`;
  if (m < 60) return `${Math.round(m)}m`;
  const h = Math.floor(m / 60);
  const rem = Math.round(m % 60);
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

function FilterDropdown({ value, onChange }: { value: DateFilter; onChange: (f: DateFilter) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = DATE_FILTERS.find((f) => f.key === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-3 transition-all duration-200"
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
        {current?.label}
        <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 w-36 py-1 rounded-xl bg-surface-3 border border-divider shadow-xl">
          {DATE_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { onChange(f.key); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors duration-150 ${
                value === f.key
                  ? "text-accent font-medium"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const BarTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl bg-surface-2 border border-divider shadow-lg text-xs">
      <p className="text-text-muted">{label}</p>
      <p className="text-text-primary font-semibold">{payload[0].value} page(s)</p>
    </div>
  );
};

export function AnalyticsModal({ pages, onClose }: AnalyticsModalProps) {
  const [view, setView] = useState<ChartView>("activity");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const filteredPages = useMemo(() => filterByDate(pages, dateFilter), [pages, dateFilter]);
  const hourlyData = useMemo(() => processHourlyData(filteredPages), [filteredPages]);
  const domainData = useMemo(() => processDomainData(filteredPages), [filteredPages]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      {/* Top bar */}
      <div className="relative flex items-center justify-between px-8 h-16 border-b border-divider">
        <span className="font-[var(--font-heading)] text-lg font-extrabold tracking-[0.15em] uppercase">
          RECALL
        </span>
        <div className="absolute left-1/2 -translate-x-1/2">
          <button
            onClick={onClose}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-all duration-200 underline underline-offset-4"
          >
            Back to Chat
          </button>
        </div>
        <div className="w-20" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-text-primary mb-2 tracking-tight">
              This is your analytics
            </h1>
            <p className="text-text-secondary text-sm">
              Your browsing activity at a glance.
            </p>
          </div>

          {/* Chart toggle */}
          <div className="flex justify-center mb-8">
            <div className="flex gap-1 p-1 rounded-xl bg-surface-2 border border-divider">
              <button
                onClick={() => setView("activity")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  view === "activity"
                    ? "bg-accent text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Activity by Hour
              </button>
              <button
                onClick={() => setView("domains")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  view === "domains"
                    ? "bg-accent text-white shadow-md"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                Time by Domain
              </button>
            </div>
          </div>

          {/* Chart area */}
          <div className="rounded-2xl bg-surface-2 border border-divider p-6">
            {view === "activity" ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-text-secondary">
                    Pages visited by hour of day
                  </h2>
                  <FilterDropdown value={dateFilter} onChange={setDateFilter} />
                </div>
                {filteredPages.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-12">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={hourlyData} barCategoryGap="20%">
                      <XAxis
                        dataKey="hour"
                        tick={{ fill: "#66666E", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        interval={2}
                      />
                      <YAxis
                        tick={{ fill: "#66666E", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<BarTooltip />} cursor={false} />
                      <Bar
                        dataKey="pages"
                        fill="rgba(58, 123, 253, 0.55)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-text-secondary">
                    Estimated time spent by domain
                  </h2>
                  <FilterDropdown value={dateFilter} onChange={setDateFilter} />
                </div>
                {domainData.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-12">No data yet.</p>
                ) : (
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="50%" height={320}>
                      <PieChart>
                        <Pie
                          data={domainData}
                          dataKey="minutes"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {domainData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload;
                            return (
                              <div className="px-3 py-2 rounded-xl bg-surface-2 border border-divider shadow-lg text-xs">
                                <p className="text-text-primary font-semibold">{d.name}</p>
                                <p className="text-text-muted">{formatMinutes(d.minutes)}</p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {domainData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-3">
                          <span
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-sm text-text-primary truncate flex-1">{d.name}</span>
                          <span className="text-xs text-text-muted">{formatMinutes(d.minutes)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
