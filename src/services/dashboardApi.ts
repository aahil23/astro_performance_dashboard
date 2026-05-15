export const DASHBOARD_API_URL =
  "https://script.google.com/a/macros/getlokalapp.com/s/AKfycbyOKfYk15W0hQtZst3n0t1vS4_OV1qAn1Wn1DKkGBwjVJIREW9K5gmQw880wWHdnGrY/exec";

export type ApiStatus = "Weak" | "Average" | "Strong" | "Elite";

export interface BenchmarkBands {
  p0: number;
  p75: number;
  p90: number;
  p95: number;
  p100: number;
}

export interface ApiMetric {
  metric_key: string;
  period_label: string;
  score: number;
  unit: string;
  rank: number | null;
  status: ApiStatus | null;
  benchmark_bands: BenchmarkBands | null;
}

export interface ApiExpert {
  expert_id: string;
  name: string;
  phone_number: string;
}

export type SectionKey =
  | "critical_performance"
  | "profile_performance"
  | "availability_performance"
  | "earnings_overview"
  | "engagement_overview";

export interface DashboardResponse {
  success: true;
  expert: ApiExpert;
  metrics_by_section: Record<SectionKey, ApiMetric[]>;
  meta: { generated_at: string };
}

export const SECTION_ORDER: SectionKey[] = [
  "critical_performance",
  "availability_performance",
  "profile_performance",
  "earnings_overview",
  "engagement_overview",
];

export const SECTION_TITLES: Record<SectionKey, string> = {
  critical_performance: "Critical Performance",
  profile_performance: "Profile Performance",
  availability_performance: "Availability Performance",
  earnings_overview: "Earnings Overview",
  engagement_overview: "Engagement Overview",
};

export const METRIC_CONFIG: Record<string, { title: string; description: string }> = {
  d0_ttpu: {
    title: "D0 TTPU",
    description:
      "D0 TTPU shows short-term user conversion performance from the latest eligible users.",
  },
  d14_ttpu: {
    title: "D14 TTPU",
    description:
      "D14 TTPU shows longer-term user conversion performance from the latest eligible users.",
  },
  avg_chat_rating: {
    title: "Average Chat Rating",
    description: "Average rating received from paid chat consultations.",
  },
  avg_audio_rating: {
    title: "Average Audio Rating",
    description: "Average rating received from paid audio consultations.",
  },
  avg_video_rating: {
    title: "Average Video Rating",
    description: "Average rating received from paid video consultations.",
  },
  chat_available_hours: {
    title: "Chat Available Hours",
    description: "Total chat availability hours in the selected period.",
  },
  audio_available_hours: {
    title: "Audio Available Hours",
    description: "Total audio availability hours in the selected period.",
  },
  video_available_hours: {
    title: "Video Available Hours",
    description: "Total video availability hours in the selected period.",
  },
  earnings_l7: {
    title: "Last 7 Days Earnings",
    description: "Total earnings generated in the last 7 days.",
  },
  earnings_l14: {
    title: "Last 14 Days Earnings",
    description: "Total earnings generated in the last 14 days.",
  },
  earnings_l30: {
    title: "Last 30 Days Earnings",
    description: "Total earnings generated in the last 30 days.",
  },
  chat_busy_time_l7: {
    title: "Chat Busy Time",
    description: "Total busy chat minutes in the last 7 days.",
  },
  chat_online_time_l7: {
    title: "Chat Online Time",
    description: "Total online chat minutes in the last 7 days.",
  },
  audio_busy_time_l7: {
    title: "Audio Busy Time",
    description: "Total busy audio minutes in the last 7 days.",
  },
  audio_online_time_l7: {
    title: "Audio Online Time",
    description: "Total online audio minutes in the last 7 days.",
  },
  video_busy_time_l7: {
    title: "Video Busy Time",
    description: "Total busy video minutes in the last 7 days.",
  },
  video_online_time_l7: {
    title: "Video Online Time",
    description: "Total online video minutes in the last 7 days.",
  },
};

function toTitleCase(key: string): string {
  return key
    .split("_")
    .map((p) => (p.length ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

export function getMetricTitle(key: string): string {
  return METRIC_CONFIG[key]?.title ?? toTitleCase(key);
}

export function getMetricDescription(key: string): string {
  return METRIC_CONFIG[key]?.description ?? "";
}

export function formatMetricValue(score: number, unit: string): string {
  switch ((unit || "").toLowerCase()) {
    case "percent":
      return `${score}%`;
    case "rating":
      return Number(score).toFixed(2);
    case "hours":
      return `${score} hrs`;
    case "minutes":
      return `${score} mins`;
    case "inr":
      return `₹${Number(score).toLocaleString("en-IN")}`;
    default:
      return `${score}${unit ? " " + unit : ""}`;
  }
}

export const STATUS_COLORS: Record<ApiStatus, string> = {
  Weak: "var(--status-critical)",
  Average: "var(--status-stable)",
  Strong: "var(--status-strong)",
  Elite: "var(--status-elite)",
};

export function getStatusColor(status: ApiStatus | null): string {
  if (!status) return "var(--status-na)";
  return STATUS_COLORS[status] ?? "var(--status-na)";
}

export class DashboardApiError extends Error {
  constructor(message: string, public kind: "not_found" | "disabled" | "network") {
    super(message);
  }
}

export async function fetchDashboardByPhone(
  phoneNumber: string,
): Promise<DashboardResponse> {
  let res: Response;
  try {
    res = await fetch(
      `${DASHBOARD_API_URL}?action=getDashboardByPhone&phone_number=${encodeURIComponent(
        phoneNumber,
      )}`,
    );
  } catch {
    throw new DashboardApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  let json: { success: boolean; message?: string } & Partial<DashboardResponse>;
  try {
    json = await res.json();
  } catch {
    throw new DashboardApiError(
      "Something went wrong. Please try again.",
      "network",
    );
  }

  if (json.success) return json as DashboardResponse;

  const msg = (json.message || "").toLowerCase();
  if (msg.includes("not found")) {
    throw new DashboardApiError(
      "No dashboard found for this mobile number.",
      "not_found",
    );
  }
  if (msg.includes("disabled")) {
    throw new DashboardApiError(
      "Your dashboard access is currently disabled.",
      "disabled",
    );
  }
  throw new DashboardApiError(
    "Something went wrong. Please try again.",
    "network",
  );
}
