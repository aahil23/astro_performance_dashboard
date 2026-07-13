import { DASHBOARD_API_URL } from "./dashboardApi";
import type { SaarthiData, SaarthiResponse, SaarthiLayoutItem } from "@/types/saarthi";

export class SaarthiApiError extends Error {
  constructor(
    message: string,
    public kind: "not_found" | "disabled" | "network",
  ) {
    super(message);
  }
}

const DEFAULT_LAYOUT: SaarthiLayoutItem[] = [
  { id: "focus", size: "large" },
  { id: "earnings", size: "large" },
  { id: "performance", size: "large" },
  { id: "leaderboard", size: "medium" },
  { id: "risk_meter", size: "medium" },
  { id: "priority_journey", size: "medium" },
  { id: "highlight", size: "small" },
  { id: "mantra", size: "small" },
];

function normalize(data: SaarthiData): SaarthiData {
  return {
    ...data,
    layout:
      Array.isArray(data.layout) && data.layout.length > 0
        ? data.layout
        : DEFAULT_LAYOUT,
  };
}

export async function fetchSaarthiByPhone(
  phoneNumber: string,
): Promise<SaarthiData> {
  let res: Response;
  try {
    res = await fetch(
      `${DASHBOARD_API_URL}?action=getSaarthiByPhone&phone_number=${encodeURIComponent(
        phoneNumber,
      )}`,
    );
  } catch {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  let json: Partial<SaarthiResponse> & { message?: string };
  try {
    json = (await res.json()) as SaarthiResponse;
  } catch {
    throw new SaarthiApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  if (json.success && json.data) return normalize(json.data);

  const msg = (json.message || "").toLowerCase();
  if (msg.includes("not found")) {
    throw new SaarthiApiError(
      "No Saarthi profile found for this mobile number.",
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

export function formatInr(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value)))
    return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatDuration(
  value: number | string | null | undefined,
  format?: string,
): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (format === "seconds") {
    const mins = Math.floor(n / 60);
    const secs = Math.round(n % 60);
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }
  if (format === "minutes") return `${n.toFixed(1)} min`;
  if (format === "percent") return `${n.toFixed(1)}%`;
  if (format === "inr") return formatInr(n);
  return String(value);
}