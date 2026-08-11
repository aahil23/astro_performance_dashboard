const KEY = "astrolokal_session";
const KEY_TYPE = "astrolokal_session_type";
const DISMISS_KEY = "astrolokal_impact_dismissed";

export type SessionType = "phone" | "user_id";

export const session = {
  login(phone: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(KEY, phone);
      sessionStorage.setItem(KEY_TYPE, "phone");
    }
  },
  loginWithUserId(userId: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(KEY, userId);
      sessionStorage.setItem(KEY_TYPE, "user_id");
    }
  },
  get(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(KEY);
  },
  getType(): SessionType {
    if (typeof window === "undefined") return "phone";
    const type = sessionStorage.getItem(KEY_TYPE);
    return type === "user_id" ? "user_id" : "phone";
  },
  logout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY_TYPE);
    }
  },
  dismissImpact() {
    if (typeof window !== "undefined") sessionStorage.setItem(DISMISS_KEY, "1");
  },
  isImpactDismissed(): boolean {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  },
};
