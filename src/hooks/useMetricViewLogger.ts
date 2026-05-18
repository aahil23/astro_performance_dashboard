import { useEffect, useRef } from "react";
import { isSessionActive, logAnalyticsEvent } from "@/services/analytics";

const VISIBLE_THRESHOLD = 0.5;
const DWELL_MS = 1500;

// Track which metric_keys have been logged per session to avoid duplicates
const loggedKeys = new Set<string>();

export function resetMetricViewLog() {
  loggedKeys.clear();
}

if (typeof window !== "undefined") {
  // Reset on full page reload — session storage flag check
  // (loggedKeys is in-memory; new module instance per load.)
}

export function useMetricViewLogger(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    metric_key: string;
    page_name?: string;
    metadata: Record<string, unknown>;
    enabled?: boolean;
  },
) {
  const {
    metric_key,
    page_name = "dashboard",
    metadata,
    enabled = true,
  } = options;
  const metadataRef = useRef(metadata);
  metadataRef.current = metadata;

  useEffect(() => {
    if (!enabled || !metric_key) return;
    if (typeof window === "undefined" || !("IntersectionObserver" in window))
      return;
    const el = ref.current;
    if (!el) return;
    if (loggedKeys.has(metric_key)) return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    let observer: IntersectionObserver | null = null;

    const fire = () => {
      if (loggedKeys.has(metric_key)) return;
      if (!isSessionActive()) return;
      loggedKeys.add(metric_key);
      void logAnalyticsEvent({
        event_name: "metric_card_viewed",
        page_name,
        metric_key,
        metadata: metadataRef.current,
      });
      observer?.disconnect();
    };

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= VISIBLE_THRESHOLD
          ) {
            if (!dwellTimer) dwellTimer = setTimeout(fire, DWELL_MS);
          } else if (dwellTimer) {
            clearTimeout(dwellTimer);
            dwellTimer = null;
          }
        }
      },
      { threshold: [VISIBLE_THRESHOLD] },
    );

    observer.observe(el);

    return () => {
      if (dwellTimer) clearTimeout(dwellTimer);
      observer?.disconnect();
    };
  }, [ref, metric_key, page_name, enabled]);
}
