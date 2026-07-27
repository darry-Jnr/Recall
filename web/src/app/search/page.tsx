"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { ExtensionBridge } from "@/components/search/ExtensionBridge";
import { ChatInterface } from "@/components/search/ChatInterface";
import { AnalyticsModal } from "@/components/search/AnalyticsModal";
import type { PageVisit } from "@/lib/types";

export default function SearchPage() {
  const [showAnalytics, setShowAnalytics] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-canvas overflow-hidden">
      <Navbar showAnalytics={showAnalytics} onToggleAnalytics={() => setShowAnalytics(!showAnalytics)} />
      <main className="flex-1 flex flex-col pt-4">
        <ExtensionBridge>
          {({ pages, loading, connected, refresh, deletePages }) => (
            <>
              <div className={showAnalytics ? "hidden" : "flex-1 flex flex-col"}>
                <ChatInterface
                  pages={pages as PageVisit[]}
                  loadingPages={loading}
                  connected={connected}
                  refresh={refresh}
                  deletePages={deletePages}
                />
              </div>
              {showAnalytics && (
                <AnalyticsModal pages={pages as PageVisit[]} onClose={() => setShowAnalytics(false)} />
              )}
            </>
          )}
        </ExtensionBridge>
      </main>
    </div>
  );
}

