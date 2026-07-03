import {
  normalizeDashboardResponse,
  type DashboardResponse,
} from "@/services/dashboardApi";

const KEY = "astrolokal_dashboard";
let cached: DashboardResponse | null = null;

export const dashboardStore = {
  set(d: DashboardResponse) {
    cached = normalizeDashboardResponse(d);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(cached));
      } catch {
        /* ignore */
      }
    }
  },
  get(): DashboardResponse | null {
    if (cached) return cached;
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem(KEY);
      if (s) {
        try {
          cached = normalizeDashboardResponse(JSON.parse(s) as DashboardResponse);
          sessionStorage.setItem(KEY, JSON.stringify(cached));
        } catch {
          cached = null;
        }
      }
    }
    return cached;
  },
  clear() {
    cached = null;
    if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
  },
};