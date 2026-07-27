"use client";

import { useState, useMemo } from "react";
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
  const domainCounts: Record<string, number> = {};
  pages.forEach((p) => {
    const domain = p.domain || "unknown";
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  });

  const sorted = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1]);

  const top = sorted.slice(0, 7);
  const otherCount = sorted.slice(7).reduce((sum, [, count]) => sum + count, 0);

  const result = top.map(([name, value]) => ({ name, value }));
  if (otherCount > 0) result.push({ name: "Other", value: otherCount });
  return result;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
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

  const hourlyData = useMemo(() => processHourlyData(pages), [pages]);
  const domainData = useMemo(() => processDomainData(pages), [pages]);

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
          <div className="text-center mb-10">
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
                Top Domains
              </button>
            </div>
          </div>

          {/* Chart area */}
          <div className="rounded-2xl bg-surface-2 border border-divider p-6">
            {view === "activity" ? (
              <>
                <h2 className="text-sm font-medium text-text-secondary mb-4">
                  Pages visited by hour of day
                </h2>
                {pages.length === 0 ? (
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
                      <Tooltip content={<CustomTooltip />} cursor={false} />
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
                <h2 className="text-sm font-medium text-text-secondary mb-4">
                  Visits by domain
                </h2>
                {domainData.length === 0 ? (
                  <p className="text-text-muted text-sm text-center py-12">No data yet.</p>
                ) : (
                  <div className="flex items-center gap-8">
                    <ResponsiveContainer width="50%" height={320}>
                      <PieChart>
                        <Pie
                          data={domainData}
                          dataKey="value"
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
                                <p className="text-text-muted">{d.value} page(s)</p>
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
                          <span className="text-xs text-text-muted">{d.value}</span>
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
