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
  ) {
    super(message);
  }
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
  phoneNumber: string;
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
  try {
    return await fetchSaarthiIdentityOnce(
      identifierType,
      value,
      signal,
    );
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.name === "AbortError"
    ) {
      throw err;
    }

    // Apps Script's /exec URL can transiently 404 right after a new
    // deployment (its internal redirect briefly points at a stale
    // version hash). A single short-delay retry resolves this without
    // surfacing an error to the user for what is usually a ~1s blip.
    await new Promise((resolve) =>
      setTimeout(resolve, 900),
    );

    return fetchSaarthiIdentityOnce(
      identifierType,
      value,
      signal,
    );
  }
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

  const data = json.data as {
    expertId: string;
    phoneNumber?: string;
    dashboardRoute: string;
    dashboard: unknown;
  };

  return {
    expertId: String(data.expertId),
    phoneNumber: String(data.phoneNumber ?? ""),
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
