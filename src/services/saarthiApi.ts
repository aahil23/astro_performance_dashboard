import { adaptSaarthiExperience } from "@/adapters/saarthiAdapter";
import type { SaarthiData, SaarthiRawEnvelope } from "@/types/saarthi";

export const SAARTHI_API_URL =
  "https://script.google.com/macros/s/AKfycbyA_ze-ZViNOOxcw7oCLBhzkHtndF9GWpoWjPg9kxUphuzmT42j26BxWson4riSkRGyNQ/exec";

export const SAARTHI_API_TOKEN =
  "8b7f3a1c5d9e2f4a6b8c0d1e3f5g7h9j";

export class SaarthiApiError extends Error {
  constructor(
    message: string,
    public kind:
      | "not_found"
      | "disabled"
      | "network"
      | "invalid_response",
    public retryable = false,
  ) {
    super(message);
  }
}

const RETRY_DELAYS_MS = [800, 1600];

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

/**
 * Runs `attempt` up to 3 times, retrying only on transient failures
 * (network errors / non-2xx responses), with exponential backoff.
 */
async function withRetries<T>(
  label: string,
  attempt: () => Promise<T>,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i <= RETRY_DELAYS_MS.length; i++) {
    try {
      return await attempt();
    } catch (err) {
      if (
        err instanceof DOMException &&
        err.name === "AbortError"
      ) {
        throw err;
      }

      lastError = err;

      const retryable =
        err instanceof SaarthiApiError
          ? err.retryable
          : true;

      console.warn(
        `[${label}] attempt ${i + 1} failed`,
        {
          retryable,
          error:
            err instanceof Error
              ? err.message
              : String(err),
          status:
            err instanceof SaarthiApiError
              ? err.kind
              : undefined,
        },
      );

      if (
        !retryable ||
        i === RETRY_DELAYS_MS.length
      ) {
        throw err;
      }

      await sleep(RETRY_DELAYS_MS[i]);
    }
  }

  throw lastError;
}

function isRawEnvelope(
  json: unknown,
): json is SaarthiRawEnvelope {
  if (
    typeof json !== "object" ||
    json === null
  ) {
    return false;
  }

  const candidate =
    json as Record<string, unknown>;

  return (
    typeof candidate.success ===
      "boolean" &&
    typeof candidate.statusCode ===
      "number"
  );
}

/**
 * Fetches the Saarthi "experience" dashboard JSON for a given expert_id
 * and normalizes it into the shape the existing Saarthi widgets expect.
 *
 * Never call this with a phone number — the backend contract for this
 * endpoint is keyed on expert_id.
 */
export async function fetchSaarthiExperience(
  expertId: string | number,
  signal?: AbortSignal,
): Promise<SaarthiData> {
  const params = new URLSearchParams({
    action: "experience",
    expert_id: String(expertId),
    token: SAARTHI_API_TOKEN,
  });

  let res: Response;

  try {
    res = await fetch(
      `${SAARTHI_API_URL}?${params.toString()}`,
      { signal },
    );
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === "AbortError"
    ) {
      throw err;
    }

    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
      true,
    );
  }

  if (!res.ok) {
    throw new SaarthiApiError(
      `Something went wrong. Please try again.`,
      "network",
      true,
    );
  }

  let json: unknown;

  try {
    json = await res.json();
  } catch {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  if (!isRawEnvelope(json)) {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "invalid_response",
    );
  }

  if (!json.success || !json.data) {
    const msg = String(
      json.message ??
      "",
    ).toLowerCase();

    if (msg.includes("not found")) {
      throw new SaarthiApiError(
        "No Saarthi profile found for this expert.",
        "not_found",
      );
    }

    if (msg.includes("disabled")) {
      throw new SaarthiApiError(
        "Your Saarthi access is currently disabled.",
        "disabled",
      );
    }

    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  return adaptSaarthiExperience(
    json.data,
  );
}

export interface SaarthiIdentity {
  expertId: string;
  dashboardRoute: "saarthi" | "dashboard";
  dashboard: SaarthiData | null;
}

/**
 * Resolves identity (by user_id or phone) against the Saarthi project's
 * own login_creds sheet, and — when the expert's dashboard_route is
 * "saarthi" — returns the full dashboard payload in the same response.
 * This replaces the old two-step flow (v1 Login Sheet -> Saarthi) with
 * a single round trip for the common case.
 */
export async function fetchSaarthiIdentity(
  identifierType: "user_id" | "phone",
  value: string,
  signal?: AbortSignal,
): Promise<SaarthiIdentity> {
  // Apps Script's /exec URL can transiently 404 right after a new
  // deployment, so transient failures are retried with backoff.
  return withRetries("saarthi:identity", () =>
    fetchSaarthiIdentityOnce(
      identifierType,
      value,
      signal,
    ),
  );
}

async function fetchSaarthiIdentityOnce(
  identifierType: "user_id" | "phone",
  value: string,
  signal?: AbortSignal,
): Promise<SaarthiIdentity> {
  const action =
    identifierType === "user_id"
      ? "identityByUserId"
      : "identityByPhone";

  const paramKey =
    identifierType === "user_id"
      ? "user_id"
      : "phone_number";

  const params = new URLSearchParams({
    action,
    [paramKey]: value,
    token: SAARTHI_API_TOKEN,
  });

  let res: Response;

  try {
    res = await fetch(
      `${SAARTHI_API_URL}?${params.toString()}`,
      { signal },
    );
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === "AbortError"
    ) {
      throw err;
    }

    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  if (!res.ok) {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  let json: unknown;

  try {
    json = await res.json();
  } catch {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  if (!isRawEnvelope(json)) {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "invalid_response",
    );
  }

  if (!json.success || !json.data) {
    const msg = String(
      json.message ?? "",
    ).toLowerCase();

    if (msg.includes("not found")) {
      throw new SaarthiApiError(
        "No dashboard found for this account.",
        "not_found",
      );
    }

    if (msg.includes("disabled")) {
      throw new SaarthiApiError(
        "Your dashboard access is currently disabled.",
        "disabled",
      );
    }

    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  const data = json.data as unknown as {
    expertId: string;
    dashboardRoute: string;
    dashboard: unknown;
  };

  return {
    expertId: String(data.expertId),
    dashboardRoute:
      data.dashboardRoute === "saarthi"
        ? "saarthi"
        : "dashboard",
    dashboard: data.dashboard
      ? adaptSaarthiExperience(
          data.dashboard as Parameters<
            typeof adaptSaarthiExperience
          >[0],
        )
      : null,
  };
}

/**
 * Lightweight health check against the Saarthi API.
 * Never throws — returns false on any failure.
 */
export async function checkSaarthiHealth(
  signal?: AbortSignal,
): Promise<boolean> {
  try {
    const params = new URLSearchParams({
      action: "health",
    });

    const res = await fetch(
      `${SAARTHI_API_URL}?${params.toString()}`,
      { signal },
    );

    if (!res.ok) {
      return false;
    }

    const json =
      (await res.json()) as {
        success?: boolean;
      };

    return Boolean(json?.success);
  } catch {
    return false;
  }
}

export function formatInr(
  value: number | null | undefined,
): string {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  return `₹${Number(value).toLocaleString(
    "en-IN",
  )}`;
}

export function formatDuration(
  value:
    | number
    | string
    | null
    | undefined,
  format?: string,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const n = Number(value);

  if (Number.isNaN(n)) {
    return String(value);
  }

  if (format === "seconds") {
    const mins = Math.floor(n / 60);
    const secs = Math.round(n % 60);

    return `${mins}m ${secs
      .toString()
      .padStart(2, "0")}s`;
  }

  if (format === "minutes") {
    return `${n.toFixed(1)} min`;
  }

  if (format === "percent") {
    return `${Math.min(
      100,
      n,
    ).toFixed(1)}%`;
  }

  if (format === "inr") {
    return formatInr(n);
  }

  return String(value);
}
