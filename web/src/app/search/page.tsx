"use client";

import { Navbar } from "@/components/landing/Navbar";
import { ExtensionBridge } from "@/components/search/ExtensionBridge";
import { ChatInterface } from "@/components/search/ChatInterface";
import type { PageVisit } from "@/lib/types";

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas overflow-hidden">
      <Navbar />
      <main className="flex-1 flex flex-col pt-4">
        <ExtensionBridge>
          {({ pages, loading, connected, refresh, deletePages }) => (
            <ChatInterface
              pages={pages as PageVisit[]}
              loadingPages={loading}
              connected={connected}
              refresh={refresh}
              deletePages={deletePages}
            />
          )}
        </ExtensionBridge>
      </main>
    </div>
  );
}

