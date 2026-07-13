import type { SaarthiData } from "@/types/saarthi";

const KEY = "astrolokal_saarthi";
let cached: SaarthiData | null = null;

export const saarthiStore = {
  set(d: SaarthiData) {
    cached = d;
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(d));
      } catch {
        /* ignore */
      }
    }
  },
  get(): SaarthiData | null {
    if (cached) return cached;
    if (typeof window !== "undefined") {
      const s = sessionStorage.getItem(KEY);
      if (s) {
        try {
          cached = JSON.parse(s) as SaarthiData;
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