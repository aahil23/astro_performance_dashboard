import { adaptSaarthiExperience } from "@/adapters/saarthiAdapter";
import type { SaarthiData, SaarthiRawEnvelope } from "@/types/saarthi";

export const SAARTHI_API_URL =
  "https://script.google.com/macros/s/AKfycbwf_zlAdMZqx073oUSR1yKgpXygCwe_O_QWtFybcBChcqynxt_mG-9o_8sjy9rar00xVQ/exec";

const SAARTHI_API_TOKEN = "8b7f3a1c5d9e2f4a6b8c0d1e3f5g7h9j";

export class SaarthiApiError extends Error {
  constructor(
    message: string,
    public kind: "not_found" | "disabled" | "network" | "invalid_response",
  ) {
    super(message);
  }
}

function isRawEnvelope(json: unknown): json is SaarthiRawEnvelope {
  if (typeof json !== "object" || json === null) return false;
  const candidate = json as Record<string, unknown>;
  return typeof candidate.success === "boolean" && typeof candidate.statusCode === "number";
}

/**
 * Fetches the Saarthi "experience" dashboard JSON for a given expert_id and
 * normalizes it into the shape the existing Saarthi widgets expect.
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
    res = await fetch(`${SAARTHI_API_URL}?${params.toString()}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new SaarthiApiError("Something went wrong. Please try again.", "network");
  }

  if (!res.ok) {
    throw new SaarthiApiError("Something went wrong. Please try again.", "network");
  }

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    throw new SaarthiApiError("Something went wrong. Please try again.", "network");
  }

  if (!isRawEnvelope(json)) {
    throw new SaarthiApiError("Something went wrong. Please try again.", "invalid_response");
  }

  if (!json.success || !json.data) {
    const msg = (json.message || "").toLowerCase();
    if (msg.includes("not found")) {
      throw new SaarthiApiError("No Saarthi profile found for this expert.", "not_found");
    }
    if (msg.includes("disabled")) {
      throw new SaarthiApiError("Your Saarthi access is currently disabled.", "disabled");
    }
    throw new SaarthiApiError("Something went wrong. Please try again.", "network");
  }

  return adaptSaarthiExperience(json.data);
}

/**
 * Lightweight health check against the Saarthi API. Never throws — returns
 * false on any failure so callers can use it for diagnostics without
 * disrupting the main flow.
 */
export async function checkSaarthiHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const params = new URLSearchParams({ action: "health", token: SAARTHI_API_TOKEN });
    const res = await fetch(`${SAARTHI_API_URL}?${params.toString()}`, { signal });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return Boolean(json?.success);
  } catch {
    return false;
  }
}

export function formatInr(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatDuration(value: number | string | null | undefined, format?: string): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (format === "seconds") {
    const mins = Math.floor(n / 60);
    const secs = Math.round(n % 60);
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }
  if (format === "minutes") return `${n.toFixed(1)} min`;
  if (format === "percent") return `${Math.min(100, n).toFixed(1)}%`;
  if (format === "inr") return formatInr(n);
  return String(value);
}
