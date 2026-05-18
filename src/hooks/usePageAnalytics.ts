import { useEffect, useRef } from "react";
import {
  isSessionActive,
  logAnalyticsEvent,
  logAnalyticsEventBeacon,
} from "@/services/analytics";

export function usePageAnalytics(pageName: string) {
  const startedAtRef = useRef<string | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    if (!isSessionActive()) return;
    const startedAt = new Date().toISOString();
    startedAtRef.current = startedAt;
    endedRef.current = false;

    void logAnalyticsEvent({
      event_name: "page_view_started",
      page_name: pageName,
      created_at: startedAt,
      ended_at: startedAt,
      duration_minutes: 0,
      metadata: {},
    });

    const endPage = (reason: "navigation" | "unload" | "hidden") => {
      if (endedRef.current) return;
      const start = startedAtRef.current;
      if (!start) return;
      endedRef.current = true;
      const endedAt = new Date().toISOString();
      const duration = Number(
        (
          (new Date(endedAt).getTime() - new Date(start).getTime()) /
          60000
        ).toFixed(2),
      );
      const payload = {
        event_name: "page_view_ended",
        page_name: pageName,
        created_at: start,
        ended_at: endedAt,
        duration_minutes: duration,
        metadata: { end_reason: reason },
      };
      if (reason === "unload" || reason === "hidden") {
        logAnalyticsEventBeacon(payload);
      } else {
        void logAnalyticsEvent(payload);
      }
    };

    const handleVis = () => {
      if (document.visibilityState === "hidden") endPage("hidden");
    };
    const handleUnload = () => endPage("unload");

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    document.addEventListener("visibilitychange", handleVis);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      document.removeEventListener("visibilitychange", handleVis);
      endPage("navigation");
    };
  }, [pageName]);
}
