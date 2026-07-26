"use client";

import { useEffect, useState, useCallback, type ReactNode } from "react";
import type { PageVisit } from "@/lib/types";

interface ExtensionBridgeProps {
  children: (props: {
    pages: PageVisit[];
    loading: boolean;
    connected: boolean;
    refresh: () => void;
  }) => ReactNode;
}

export function ExtensionBridge({ children }: ExtensionBridgeProps) {
  const [pages, setPages] = useState<PageVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const requestData = useCallback(() => {
    setLoading(true);
    window.postMessage({ type: "RECALL_REQUEST_DATA" }, "*");
  }, []);

  useEffect(() => {
    let dataTimeout: ReturnType<typeof setTimeout>;

    const dataHandler = (event: MessageEvent) => {
      if (event.data?.type !== "RECALL_RESPONSE_DATA") return;
      console.log("[Recall web] 📥 RECALL_RESPONSE_DATA received:", event.data);
      clearTimeout(dataTimeout);
      if (event.data.error) {
        console.warn("[Recall web] ❌ Response had error:", event.data.error);
        setConnected(false);
        setLoading(false);
        return;
      }
      console.log("[Recall web] ✅ Connected! Pages:", event.data.pages?.length);
      setConnected(true);
      setPages(event.data.pages || []);
      setLoading(false);
    };

    const installHandler = (event: MessageEvent) => {
      if (event.data?.type !== "RECALL_INSTALLED") return;
      console.log("[Recall web] ✅ RECALL_INSTALLED received — extension is present");
      window.removeEventListener("message", installHandler);
      clearTimeout(installTimeout);

      console.log("[Recall web] 📤 Sending RECALL_REQUEST_DATA...");
      window.postMessage({ type: "RECALL_REQUEST_DATA" }, "*");
      dataTimeout = setTimeout(() => {
        console.warn("[Recall web] ⏰ Timed out waiting for RECALL_RESPONSE_DATA (5s)");
        setLoading(false);
      }, 5000);
    };

    window.addEventListener("message", installHandler);
    window.addEventListener("message", dataHandler);

    console.log("[Recall web] 📤 Sending RECALL_CHECK_INSTALLED...");
    const installTimeout = setTimeout(() => {
      console.warn("[Recall web] ⏰ Timed out waiting for RECALL_INSTALLED (1.5s) — extension not detected");
      window.removeEventListener("message", installHandler);
      setLoading(false);
    }, 1500);

    window.postMessage({ type: "RECALL_CHECK_INSTALLED" }, "*");

    return () => {
      window.removeEventListener("message", installHandler);
      window.removeEventListener("message", dataHandler);
      clearTimeout(installTimeout);
      clearTimeout(dataTimeout);
    };
  }, []);

  return <>{children({ pages, loading, connected, refresh: requestData })}</>;
}
