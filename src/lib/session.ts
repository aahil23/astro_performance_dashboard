const KEY = "astrolokal_session";
const DISMISS_KEY = "astrolokal_impact_dismissed";

export const session = {
  login(phone: string) {
    if (typeof window !== "undefined") sessionStorage.setItem(KEY, phone);
  },
  get(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(KEY);
  },
  logout() {
    if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
  },
  dismissImpact() {
    if (typeof window !== "undefined") sessionStorage.setItem(DISMISS_KEY, "1");
  },
  isImpactDismissed(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  },
};