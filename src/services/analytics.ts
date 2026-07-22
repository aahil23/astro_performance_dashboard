import {
  getSaarthiApiToken,
  getSaarthiApiUrl,
} from "./saarthiApi";

const SESSION_KEY = "astrolokal_analytics_session";
const SESSION_META_KEY = "astrolokal_analytics_session_meta";
const SESSION_ENDED_FLAG = "astrolokal_analytics_session_ended";
const SESSION_STARTED_LOGGED_KEY =
  "astrolokal_analytics_session_started_logged";

const INACTIVITY_MS = 15 * 60 * 1000;

let inactivityLogoutHandler: (() => void) | null = null;

export function registerInactivityLogoutHandler(
  handler: () => void,
): void {
  inactivityLogoutHandler = handler;
}

export interface AnalyticsEventPayload {
  event_id: string;
  event_name: string;
  expert_id: string;
  phone_number: string;
  session_id: string;
  created_at: string;
  ended_at: string;
  duration_minutes: number | "";
  metadata_json: string;
}

export interface AnalyticsEventInput {
  event_name: string;
  created_at?: string;
  ended_at?: string;
  duration_minutes?: number | "";
  metadata?: Record<string, unknown>;
  expert_id?: string;
  phone_number?: string;
  session_id?: string;

  variant?: string;
  dashboard_version?: string;
  current_priority?: string;
  page_name?: string;
  widget_id?: string;
  widget_position?: number | string;
  widget_size?: string;
  primary_focus?: string;
  metric_name?: string;
  content_id?: string;
  cta_target?: string;
  visible_duration_ms?: number;
  time_since_page_open_ms?: number;
}

interface SessionMeta {
  expert_id: string;
  phone_number: string;
}

interface SaarthiAnalyticsEvent {
  event_id: string;
  event_timestamp_ist: string;
  expert_id: string;
  session_id: string;
  variant: string;
  dashboard_version: string;
  current_priority: string;
  event_name: string;
  page_name: string;
  widget_id: string;
  widget_position: number | string | "";
  widget_size: string;
  primary_focus: string;
  metric_name: string;
  content_id: string;
  cta_target: string;
  visible_duration_ms: number | "";
  time_since_page_open_ms: number | "";
  metadata: Record<string, unknown>;
  user_agent: string;
}

interface SaarthiAnalyticsRequest {
  action: "analytics";
  token: string;
  event: SaarthiAnalyticsEvent;
}

function isDev(): boolean {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
}

function warn(...args: unknown[]): void {
  if (isDev()) {
    console.warn("[analytics]", ...args);
  }
}

function debug(...args: unknown[]): void {
  if (isDev()) {
    console.log("[analytics]", ...args);
  }
}

export function generateEventId(): string {
  const cryptoObj =
    typeof globalThis !== "undefined"
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;

  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }

  return `evt_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 11)}`;
}

function newSessionId(): string {
  return `sess_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 11)}`;
}

export function getSessionMeta(): SessionMeta | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(SESSION_META_KEY);
    return raw
      ? (JSON.parse(raw) as SessionMeta)
      : null;
  } catch {
    return null;
  }
}

export function setSessionMeta(meta: SessionMeta): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      SESSION_META_KEY,
      JSON.stringify(meta),
    );
  } catch {
    // Ignore storage failures.
  }
}

export function getSessionId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return newSessionId();
  }

  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    const ended =
      sessionStorage.getItem(SESSION_ENDED_FLAG) === "1";

    if (existing && !ended) {
      return existing;
    }

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
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      sessionStorage.getItem(
        SESSION_STARTED_LOGGED_KEY,
      ) === "1"
    );
  } catch {
    return false;
  }
}

export function markSessionStartedLogged(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(
      SESSION_STARTED_LOGGED_KEY,
      "1",
    );
  } catch {
    // Ignore storage failures.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_META_KEY);
    sessionStorage.removeItem(SESSION_ENDED_FLAG);
    sessionStorage.removeItem(SESSION_STARTED_LOGGED_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function safelyParseMetadata(
  metadataJson: string,
): Record<string, unknown> {
  try {
    const parsed = JSON.parse(metadataJson) as unknown;

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Fall through to an empty metadata object.
  }

  return {};
}

function buildPayload(
  input: AnalyticsEventInput,
): AnalyticsEventPayload | null {
  const meta = getSessionMeta();

  const expert_id =
    input.expert_id ??
    meta?.expert_id ??
    "";

  const phone_number =
    input.phone_number ??
    meta?.phone_number ??
    "";

  const session_id =
    input.session_id ??
    getSessionId() ??
    "";

  if (!session_id) {
    warn(
      "Event skipped because session_id is missing.",
      input.event_name,
    );
    return null;
  }

  const created_at =
    input.created_at ??
    new Date().toISOString();

  return {
    event_id: generateEventId(),
    event_name: input.event_name,
    expert_id,
    phone_number,
    session_id,
    created_at,
    ended_at: input.ended_at ?? "",
    duration_minutes:
      typeof input.duration_minutes === "number"
        ? input.duration_minutes
        : "",
    metadata_json: JSON.stringify(
      input.metadata ?? {},
    ),
  };
}

function buildSaarthiRequest(
  payload: AnalyticsEventPayload,
  input: AnalyticsEventInput,
): SaarthiAnalyticsRequest {
  const metadata = {
    phone_number: payload.phone_number,
    ended_at: payload.ended_at,
    duration_minutes: payload.duration_minutes,
    ...safelyParseMetadata(payload.metadata_json),
  };

  return {
    action: "analytics",
    token: getSaarthiApiToken(),
    event: {
      event_id: payload.event_id,
      event_timestamp_ist: payload.created_at,
      expert_id: payload.expert_id,
      session_id: payload.session_id,
      variant: input.variant ?? "treatment",
      dashboard_version:
        input.dashboard_version ?? "saarthi_v1",
      current_priority:
        input.current_priority ?? "",
      event_name: payload.event_name,
      page_name: input.page_name ?? "saarthi",
      widget_id: input.widget_id ?? "",
      widget_position:
        input.widget_position ?? "",
      widget_size: input.widget_size ?? "",
      primary_focus:
        input.primary_focus ?? "",
      metric_name: input.metric_name ?? "",
      content_id: input.content_id ?? "",
      cta_target: input.cta_target ?? "",
      visible_duration_ms:
        typeof input.visible_duration_ms === "number"
          ? input.visible_duration_ms
          : "",
      time_since_page_open_ms:
        typeof input.time_since_page_open_ms === "number"
          ? input.time_since_page_open_ms
          : "",
      metadata,
      user_agent:
        typeof navigator !== "undefined"
          ? navigator.userAgent
          : "",
    },
  };
}

export async function logAnalyticsEvent(
  input: AnalyticsEventInput,
): Promise<void> {
  const payload = buildPayload(input);

  if (!payload) {
    return;
  }

  try {
    const analyticsUrl = getSaarthiApiUrl();
    const requestBody =
      buildSaarthiRequest(payload, input);

    debug("URL", analyticsUrl);
    debug("request", requestBody);

    const response = await fetch(analyticsUrl, {
      method: "POST",
      mode: "cors",
      keepalive: true,
      cache: "no-store",
      headers: {
        "Content-Type":
          "text/plain;charset=UTF-8",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();

    let result:
      | {
          success?: boolean;
          error?: string;
          statusCode?: number;
        }
      | null = null;

    try {
      result = JSON.parse(responseText) as {
        success?: boolean;
        error?: string;
        statusCode?: number;
      };
    } catch {
      throw new Error(
        `Invalid analytics response: ${responseText}`,
      );
    }

    if (!result?.success) {
      throw new Error(
        result?.error ??
          "Analytics API returned an unsuccessful response.",
      );
    }

    debug("captured", result);
  } catch (err) {
    warn("fetch failed", err);
  }
}

export function logAnalyticsEventBeacon(
  input: AnalyticsEventInput,
): void {
  const payload = buildPayload(input);

  if (!payload) {
    return;
  }

  try {
    const analyticsUrl = getSaarthiApiUrl();
    const requestBody =
      buildSaarthiRequest(payload, input);

    if (
      typeof navigator !== "undefined" &&
      navigator.sendBeacon
    ) {
      const blob = new Blob(
        [JSON.stringify(requestBody)],
        {
          type: "text/plain;charset=UTF-8",
        },
      );

      const accepted =
        navigator.sendBeacon(
          analyticsUrl,
          blob,
        );

      if (accepted) {
        return;
      }
    }

    void logAnalyticsEvent(input);
  } catch (err) {
    warn("beacon failed", err);
  }
}

let inactivityTimer:
  | ReturnType<typeof setTimeout>
  | null = null;

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

function resetInactivityTimer(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(() => {
    endSession("inactivity");
    inactivityLogoutHandler?.();
  }, INACTIVITY_MS);
}

function onActivity(): void {
  if (typeof window === "undefined") {
    return;
  }

  if (
    sessionStorage.getItem(
      SESSION_ENDED_FLAG,
    ) === "1"
  ) {
    return;
  }

  resetInactivityTimer();
}

function attachActivityListeners(): void {
  if (
    typeof window === "undefined" ||
    activityListenersAttached
  ) {
    return;
  }

  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(
      eventName,
      onActivity,
      { passive: true },
    );
  });

  activityListenersAttached = true;
}

function attachUnloadListeners(): void {
  if (
    typeof window === "undefined" ||
    unloadListenersAttached
  ) {
    return;
  }

  const handleUnload = (): void => {
    endSession("unload");
  };

  window.addEventListener(
    "beforeunload",
    handleUnload,
  );

  window.addEventListener(
    "pagehide",
    handleUnload,
  );

  unloadListenersAttached = true;
}

export function startSession(
  meta: SessionMeta,
): string {
  const existingMeta = getSessionMeta();

  const expertChanged =
    existingMeta &&
    (
      existingMeta.expert_id !==
        meta.expert_id ||
      existingMeta.phone_number !==
        meta.phone_number
    );

  if (expertChanged) {
    clearSession();
    sessionStartedAt = null;
  }

  setSessionMeta(meta);

  const sessionId =
    getOrCreateSessionId();

  if (!sessionStartedAt) {
    sessionStartedAt =
      new Date().toISOString();
  }

  attachActivityListeners();
  attachUnloadListeners();
  resetInactivityTimer();

  return sessionId;
}

export function endSession(
  reason: "logout" | "unload" | "inactivity",
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (
      sessionStorage.getItem(
        SESSION_ENDED_FLAG,
      ) === "1"
    ) {
      return;
    }

    const sessionId =
      sessionStorage.getItem(
        SESSION_KEY,
      );

    if (!sessionId) {
      return;
    }

    const startedAt =
      sessionStartedAt ??
      new Date().toISOString();

    const endedAt =
      new Date().toISOString();

    const durationMinutes = Number(
      (
        (
          new Date(endedAt).getTime() -
          new Date(startedAt).getTime()
        ) /
        60000
      ).toFixed(2),
    );

    const input: AnalyticsEventInput = {
      event_name: "session_ended",
      created_at: startedAt,
      ended_at: endedAt,
      duration_minutes: durationMinutes,
      metadata: {
        end_reason: reason,
      },
    };

    sessionStorage.setItem(
      SESSION_ENDED_FLAG,
      "1",
    );

    if (reason === "unload") {
      logAnalyticsEventBeacon(input);
    } else {
      void logAnalyticsEvent(input);
    }

    if (reason === "logout") {
      clearSession();
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
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      sessionStorage.getItem(
        SESSION_KEY,
      ) !== null &&
      sessionStorage.getItem(
        SESSION_ENDED_FLAG,
      ) !== "1"
    );
  } catch {
    return false;
  }
}
