import type { DashboardResponse } from "@/services/dashboardApi";

const KEY = "astrolokal_dashboard";
let cached: DashboardResponse | null = null;

export const dashboardStore = {
  set(d: DashboardResponse) {
    cached = d;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(d));
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
          cached = JSON.parse(s) as DashboardResponse;
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