import { DASHBOARD_API_URL } from "./dashboardApi";

const SESSION_KEY = "astrolokal_analytics_session";
const SESSION_META_KEY = "astrolokal_analytics_session_meta";
const SESSION_ENDED_FLAG = "astrolokal_analytics_session_ended";
const INACTIVITY_MS = 10 * 60 * 1000;

const ANALYTICS_URL = `${DASHBOARD_API_URL}?action=logAnalyticsEvent`;

export interface AnalyticsEventPayload {
  event_id: string;
  event_name: string;
  expert_id: string;
  phone_number: string;
  session_id: string;
  page_name: string;
  metric_key: string;
  created_at: string;
  ended_at: string;
  duration_minutes: number;
  metadata_json: string;
}

export interface AnalyticsEventInput {
  event_name: string;
  page_name: string;
  metric_key?: string;
  created_at?: string;
  ended_at?: string;
  duration_minutes?: number;
  metadata?: Record<string, unknown>;
  expert_id?: string;
  phone_number?: string;
  session_id?: string;
}

interface SessionMeta {
  expert_id: string;
  phone_number: string;
}

function isDev(): boolean {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}

function warn(...args: unknown[]) {
  if (isDev()) {
    // eslint-disable-next-line no-console
    console.warn("[analytics]", ...args);
  }
}

export function generateEventId(): string {
  const cryptoObj =
    typeof globalThis !== "undefined"
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
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
    /* ignore */
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
    if (existing && sessionStorage.getItem(SESSION_ENDED_FLAG) !== "1") {
      return existing;
    }
    const id = newSessionId();
    sessionStorage.setItem(SESSION_KEY, id);
    sessionStorage.removeItem(SESSION_ENDED_FLAG);
    return id;
  } catch {
    return newSessionId();
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_META_KEY);
    sessionStorage.removeItem(SESSION_ENDED_FLAG);
  } catch {
    /* ignore */
  }
}

function buildPayload(input: AnalyticsEventInput): AnalyticsEventPayload | null {
  const meta = getSessionMeta();
  const expert_id = input.expert_id ?? meta?.expert_id ?? "";
  const phone_number = input.phone_number ?? meta?.phone_number ?? "";
  const session_id = input.session_id ?? getSessionId() ?? "";

  if (!session_id) return null;

  const created_at = input.created_at ?? new Date().toISOString();
  const ended_at = input.ended_at ?? created_at;
  const duration_minutes =
    typeof input.duration_minutes === "number" ? input.duration_minutes : 0;

  return {
    event_id: generateEventId(),
    event_name: input.event_name,
    expert_id,
    phone_number,
    session_id,
    page_name: input.page_name,
    metric_key: input.metric_key ?? "",
    created_at,
    ended_at,
    duration_minutes,
    metadata_json: JSON.stringify(input.metadata ?? {}),
  };
}

export async function logAnalyticsEvent(
  input: AnalyticsEventInput,
): Promise<void> {
  const payload = buildPayload(input);
  if (!payload) return;
  try {
    await fetch(ANALYTICS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch (err) {
    warn("fetch failed", err);
  }
}

export function logAnalyticsEventBeacon(input: AnalyticsEventInput): void {
  const payload = buildPayload(input);
  if (!payload) return;
  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], {
        type: "text/plain;charset=UTF-8",
      });
      const ok = navigator.sendBeacon(ANALYTICS_URL, blob);
      if (ok) return;
    }
    void logAnalyticsEvent(input);
  } catch (err) {
    warn("beacon failed", err);
  }
}

// -------- Session lifecycle --------

let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let sessionStartedAt: string | null = null;
let activityListenersAttached = false;
let unloadListenersAttached = false;

const ACTIVITY_EVENTS = [
  "mousemove",
  "scroll",
  "keydown",
  "touchstart",
  "click",
] as const;

function resetInactivityTimer() {
  if (typeof window === "undefined") return;
  if (inactivityTimer) clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    endSession("inactivity");
  }, INACTIVITY_MS);
}

function onActivity() {
  if (typeof window === "undefined") return;
  if (sessionStorage.getItem(SESSION_ENDED_FLAG) === "1") return;
  resetInactivityTimer();
}

function attachActivityListeners() {
  if (typeof window === "undefined" || activityListenersAttached) return;
  ACTIVITY_EVENTS.forEach((evt) => {
    window.addEventListener(evt, onActivity, { passive: true });
  });
  activityListenersAttached = true;
}

function attachUnloadListeners() {
  if (typeof window === "undefined" || unloadListenersAttached) return;
  const handleUnload = () => endSession("unload");
  const handleVis = () => {
    if (document.visibilityState === "hidden") endSession("unload");
  };
  window.addEventListener("beforeunload", handleUnload);
  window.addEventListener("pagehide", handleUnload);
  document.addEventListener("visibilitychange", handleVis);
  unloadListenersAttached = true;
}

export function startSession(meta: SessionMeta): string {
  setSessionMeta(meta);
  const sid = getOrCreateSessionId();
  if (!sessionStartedAt) sessionStartedAt = new Date().toISOString();
  attachActivityListeners();
  attachUnloadListeners();
  resetInactivityTimer();
  return sid;
}

export function endSession(reason: "logout" | "unload" | "inactivity"): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(SESSION_ENDED_FLAG) === "1") return;
    const sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) return;

    const startedAt = sessionStartedAt ?? new Date().toISOString();
    const endedAt = new Date().toISOString();
    const duration = Number(
      (
        (new Date(endedAt).getTime() - new Date(startedAt).getTime()) /
        60000
      ).toFixed(2),
    );

    const input: AnalyticsEventInput = {
      event_name: "session_ended",
      page_name: "dashboard",
      created_at: startedAt,
      ended_at: endedAt,
      duration_minutes: duration,
      metadata: { end_reason: reason },
    };

    sessionStorage.setItem(SESSION_ENDED_FLAG, "1");

    if (reason === "unload") {
      logAnalyticsEventBeacon(input);
    } else {
      void logAnalyticsEvent(input);
    }

    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    sessionStartedAt = null;
  } catch (err) {
    warn("endSession failed", err);
  }
}

export function isSessionActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return (
      sessionStorage.getItem(SESSION_KEY) !== null &&
      sessionStorage.getItem(SESSION_ENDED_FLAG) !== "1"
    );
  } catch {
    return false;
  }
}
