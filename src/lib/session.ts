const KEY = "astrolokal_session";
const KEY_TYPE = "astrolokal_session_type";
const KEY_PHONE = "astrolokal_session_phone";
const DISMISS_KEY = "astrolokal_impact_dismissed";

export type SessionType = "phone" | "user_id";

export const session = {
  login(phone: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(KEY, phone);
      sessionStorage.setItem(KEY_TYPE, "phone");
      // Phone login always has the real number as the identifier itself.
      sessionStorage.setItem(KEY_PHONE, phone);
    }
  },
  loginWithUserId(userId: string) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(KEY, userId);
      sessionStorage.setItem(KEY_TYPE, "user_id");
      // Real phone number isn't known yet for a user_id login -- it's
      // filled in once the backend identity response comes back.
      sessionStorage.removeItem(KEY_PHONE);
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
  /**
   * Sets the expert's real phone number, regardless of how they logged
   * in. Call this once the backend identity response is available.
   */
  setPhoneNumber(phone: string) {
    if (typeof window !== "undefined" && phone) {
      sessionStorage.setItem(KEY_PHONE, phone);
    }
  },
  /**
   * Returns the expert's real phone number for display purposes,
   * independent of whether login happened via phone or user_id.
   */
  getPhoneNumber(): string {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem(KEY_PHONE) ?? "";
  },
  logout() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(KEY);
      sessionStorage.removeItem(KEY_TYPE);
      sessionStorage.removeItem(KEY_PHONE);
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
