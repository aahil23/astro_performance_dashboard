import { SAARTHI_API_TOKEN, SAARTHI_API_URL } from "./saarthiApi";

const SESSION_KEY = "astrolokal_analytics_session";
const SESSION_META_KEY = "astrolokal_analytics_session_meta";
const SESSION_ENDED_FLAG = "astrolokal_analytics_session_ended";
const SESSION_STARTED_LOGGED_KEY = "astrolokal_analytics_session_started_logged";
const INACTIVITY_MS = 15 * 60 * 1000;

let inactivityLogoutHandler: (() => void) | null = null;
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let sessionStartedAt: string | null = null;
let activityListenersAttached = false;
let unloadListenersAttached = false;

const ACTIVITY_EVENTS = ["mousemove", "scroll", "keydown", "touchstart", "click"] as const;

interface SessionMeta {
  expert_id: string;
  phone_number: string;
  variant?: string;
  dashboard_version?: string;
  current_priority?: string;
  primary_focus?: string;
}

interface SessionAnalyticsState {
  widgets_seen: string[];
  widget_count_seen: number;
  furthest_widget_seen: string;
  furthest_widget_position: number;
  max_scroll_depth_pct: number;
  cta_clicks: Array<{ label: string; target: string; widget_id?: string }>;
  total_cta_clicks: number;
  total_interactions: number;
  personal_feedback: {
    available: boolean;
    version: number | null;
    is_new: boolean;
    popup_shown: boolean;
    popup_dismissed: boolean;
    widget_seen: boolean;
  };
}

const state: SessionAnalyticsState = createEmptyState();

function createEmptyState(): SessionAnalyticsState {
  return {
    widgets_seen: [],
    widget_count_seen: 0,
    furthest_widget_seen: "",
    furthest_widget_position: -1,
    max_scroll_depth_pct: 0,
    cta_clicks: [],
    total_cta_clicks: 0,
    total_interactions: 0,
    personal_feedback: {
      available: false,
      version: null,
      is_new: false,
      popup_shown: false,
      popup_dismissed: false,
      widget_seen: false,
    },
  };
}

function resetState() {
  Object.assign(state, createEmptyState());
}

function isDev(): boolean {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}

function warn(...args: unknown[]) {
  if (isDev()) console.warn("[analytics]", ...args);
}

function debug(...args: unknown[]) {
  if (isDev()) console.log("[analytics]", ...args);
}

export function registerInactivityLogoutHandler(handler: () => void) {
  inactivityLogoutHandler = handler;
}

export function generateEventId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

function newSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function getSessionMeta(): SessionMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_META_KEY);
    return raw ? (JSON.parse(raw) as SessionMeta) : null;
  } catch {
    return null;
  }
}

export function setSessionMeta(meta: SessionMeta) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_META_KEY, JSON.stringify(meta));
  } catch {
    // Ignore storage failure.
  }
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return newSessionId();
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    const ended = sessionStorage.getItem(SESSION_ENDED_FLAG) === "1";
    if (existing && !ended) return existing;

    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_STARTED_LOGGED_KEY);
    sessionStorage.removeItem(SESSION_ENDED_FLAG);

    const id = newSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return newSessionId();
  }
}

export function hasLoggedSessionStarted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_STARTED_LOGGED_KEY) === "1";
  } catch {
    return false;
  }
}

export function markSessionStartedLogged() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_STARTED_LOGGED_KEY, "1");
  } catch {
    // Ignore storage failure.
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_META_KEY);
    sessionStorage.removeItem(SESSION_ENDED_FLAG);
    sessionStorage.removeItem(SESSION_STARTED_LOGGED_KEY);
  } catch {
    // Ignore storage failure.
  }
  resetState();
}

export interface AnalyticsEventInput {
  event_name: "session_started" | "session_ended";
  event_timestamp_ist?: string;
  expert_id?: string;
  session_id?: string;
  variant?: string;
  dashboard_version?: string;
  current_priority?: string;
  duration_minutes?: number | "";
  metadata?: Record<string, unknown>;
}

function buildRequestBody(input: AnalyticsEventInput) {
  const meta = getSessionMeta();
  const expertId = input.expert_id ?? meta?.expert_id ?? "";
  const sessionId = input.session_id ?? getSessionId() ?? "";

  if (!expertId || !sessionId) return null;

  return {
    action: "analytics",
    token: SAARTHI_API_TOKEN,
    event: {
      event_id: generateEventId(),
      event_timestamp_ist: input.event_timestamp_ist ?? new Date().toISOString(),
      expert_id: expertId,
      session_id: sessionId,
      variant: input.variant ?? meta?.variant ?? "treatment",
      dashboard_version: input.dashboard_version ?? meta?.dashboard_version ?? "saarthi_v1",
      current_priority: input.current_priority ?? meta?.current_priority ?? "",
      event_name: input.event_name,
      duration_minutes: input.duration_minutes ?? "",
      metadata: input.metadata ?? {},
    },
  };
}

export async function logAnalyticsEvent(input: AnalyticsEventInput): Promise<void> {
  const requestBody = buildRequestBody(input);
  if (!requestBody) return;

  try {
    const response = await fetch(SAARTHI_API_URL, {
      method: "POST",
      mode: "cors",
      keepalive: true,
      cache: "no-store",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(requestBody),
    });

    const responseJson = (await response.json()) as { success?: boolean; error?: string };
    if (!responseJson?.success) throw new Error(responseJson?.error ?? "Analytics event was not captured.");
    debug("event captured", responseJson);
  } catch (error) {
    warn("fetch failed", error);
  }
}

export function logAnalyticsEventBeacon(input: AnalyticsEventInput): void {
  const requestBody = buildRequestBody(input);
  if (!requestBody) return;

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(requestBody)], { type: "text/plain;charset=UTF-8" });
      if (navigator.sendBeacon(SAARTHI_API_URL, blob)) return;
    }
    void logAnalyticsEvent(input);
  } catch (error) {
    warn("beacon failed", error);
  }
}

export function setPersonalFeedbackAnalytics(input: {
  available: boolean;
  version: number | null;
  isNew: boolean;
}) {
  state.personal_feedback.available = input.available;
  state.personal_feedback.version = input.version;
  state.personal_feedback.is_new = input.isNew;
}

export function trackPersonalFeedbackPopupShown() {
  state.personal_feedback.popup_shown = true;
  state.total_interactions += 1;
}

export function trackPersonalFeedbackPopupDismissed() {
  state.personal_feedback.popup_dismissed = true;
  state.total_interactions += 1;
}

export function trackWidgetSeen(widgetId: string, position: number) {
  if (!state.widgets_seen.includes(widgetId)) {
    state.widgets_seen.push(widgetId);
    state.widget_count_seen = state.widgets_seen.length;
  }
  if (position > state.furthest_widget_position) {
    state.furthest_widget_position = position;
    state.furthest_widget_seen = widgetId;
  }

  if (widgetId === "personal_feedback") {
    state.personal_feedback.widget_seen = true;
  }
}

export function trackScrollDepth(depthPct: number) {
  state.max_scroll_depth_pct = Math.max(
    state.max_scroll_depth_pct,
    Math.min(100, Math.max(0, Math.round(depthPct))),
  );
}

export function trackCtaClick(input: { label: string; target: string; widgetId?: string }) {
  state.cta_clicks.push({
    label: input.label,
    target: input.target,
    widget_id: input.widgetId,
  });
  state.total_cta_clicks = state.cta_clicks.length;
  state.total_interactions += 1;
}

export function trackInteraction() {
  state.total_interactions += 1;
}

export function getSessionAnalyticsSnapshot() {
  return {
    widgets_seen_json: [...state.widgets_seen],
    widget_count_seen: state.widget_count_seen,
    furthest_widget_seen: state.furthest_widget_seen,
    max_scroll_depth_pct: state.max_scroll_depth_pct,
    cta_clicks_json: [...state.cta_clicks],
    total_cta_clicks: state.total_cta_clicks,
    total_interactions: state.total_interactions,
    personal_feedback: { ...state.personal_feedback },
  };
}

function resetInactivityTimer() {
  if (typeof window === "undefined") return;
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    endSession("inactivity");
    inactivityLogoutHandler?.();
  }, INACTIVITY_MS);
}

function onActivity() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SESSION_ENDED_FLAG) === "1") return;
  resetInactivityTimer();
}

function attachActivityListeners() {
  if (typeof window === "undefined" || activityListenersAttached) return;
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, onActivity, { passive: true });
  });
  activityListenersAttached = true;
}

function attachUnloadListeners() {
  if (typeof window === "undefined" || unloadListenersAttached) return;
  const handleUnload = () => endSession("unload");
  window.addEventListener("beforeunload", handleUnload);
  window.addEventListener("pagehide", handleUnload);
  unloadListenersAttached = true;
}

export function startSession(meta: SessionMeta): string {
  const existingMeta = getSessionMeta();
  const expertChanged = existingMeta && (
    existingMeta.expert_id !== meta.expert_id ||
    existingMeta.phone_number !== meta.phone_number
  );

  if (expertChanged) {
    clearSession();
    sessionStartedAt = null;
  }

  setSessionMeta(meta);
  const sessionId = getOrCreateSessionId();
  if (!sessionStartedAt) sessionStartedAt = new Date().toISOString();

  attachActivityListeners();
  attachUnloadListeners();
  resetInactivityTimer();
  return sessionId;
}

export function endSession(reason: "logout" | "unload" | "inactivity"): void {
  if (typeof window === "undefined") return;

  try {
    if (sessionStorage.getItem(SESSION_ENDED_FLAG) === "1") return;
    const sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) return;

    const startedAt = sessionStartedAt ?? new Date().toISOString();
    const endedAt = new Date().toISOString();
    const durationMinutes = Number(
      ((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000).toFixed(2),
    );

    const input: AnalyticsEventInput = {
      event_name: "session_ended",
      event_timestamp_ist: endedAt,
      duration_minutes: durationMinutes,
      metadata: {
        end_reason: reason,
        ...getSessionAnalyticsSnapshot(),
      },
    };

    sessionStorage.setItem(SESSION_ENDED_FLAG, "1");
    if (reason === "unload") logAnalyticsEventBeacon(input);
    else void logAnalyticsEvent(input);

    if (reason === "logout") clearSession();
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = null;
    sessionStartedAt = null;
  } catch (error) {
    warn("endSession failed", error);
  }
}

export function isSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== null && sessionStorage.getItem(SESSION_ENDED_FLAG) !== "1";
  } catch {
    return false;
  }
}
