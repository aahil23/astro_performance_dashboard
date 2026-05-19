export const DASHBOARD_API_URL =
  "https://script.google.com/macros/s/AKfycbymgS_3rHo1TkoO-3fXn6MIhMpGbmB6sFYenCPAAR5VLvxIwOYoJeswvnHIXhokeRa-/exec";

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
  updated_at?: string;
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
  weekly_funnel_trends?: WeeklyFunnelTrends;
}

export interface FunnelDataPoint {
  weekday: string;
  value: number;
}

export interface FunnelMetric {
  title: string;
  metric_key: string;
  trend_percentage: number;
  trend_direction: "up" | "down" | "flat" | string;
  weekly_average: number;
  best_day: string;
  data: FunnelDataPoint[];
}

export interface Funnel {
  title: string;
  subtitle?: string;
  type: "d0" | "dn" | string;
  metrics: FunnelMetric[];
}

export interface WeeklyFunnelTrends {
  funnels: Funnel[];
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
  engagement_overview: "Utilisation Overview",
};

export const METRIC_CONFIG: Record<
  string,
  { title: string; description: string }
> = {
  d0_ttpu: {
    title: "D0 TTPU",
    description:
      "Average talk time per user on the first booking day for the latest 200 user–expert pairs.",
  },
  d14_ttpu: {
    title: "D14 TTPU",
    description:
      "Average talk time per user accumulated within 14 days of the first booking for the latest 200 user–expert pairs that completed the 14-day window.",
  },
  avg_chat_rating: {
    title: "Average Chat Rating",
    description:
      "Average user rating from repeat chat consultations over the last 90 days.",
  },
  avg_audio_rating: {
    title: "Average Audio Rating",
    description:
      "Average user rating from repeat audio consultations over the last 90 days.",
  },
  avg_video_rating: {
    title: "Average Video Rating",
    description:
      "Average user rating from repeat video consultations over the last 90 days.",
  },
  chat_available_hours: {
    title: "Chat Available Hours",
    description: "Average daily chat availability hours over the last 7 days.",
  },
  audio_available_hours: {
    title: "Audio Available Hours",
    description: "Average daily audio availability hours over the last 7 days.",
  },
  video_available_hours: {
    title: "Video Available Hours",
    description: "Average daily video availability hours over the last 7 days.",
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
  chat_utilisation_l7: {
    title: "Chat Utilisation",
    description:
      "Percentage of online chat time spent in consultations over the last 7 days. Busy hours represent consultation time within total online hours.",
  },
  audio_utilisation_l7: {
    title: "Audio Utilisation",
    description:
      "Percentage of online audio time spent in consultations over the last 7 days. Busy hours represent consultation time within total online hours.",
  },
  video_utilisation_l7: {
    title: "Video Utilisation",
    description:
      "Percentage of online video time spent in consultations over the last 7 days. Busy hours represent consultation time within total online hours.",
  },
d0_users: {
  title: "New Users",
  description:
    "Unique users who connected with you for the first time that day.",
},

d0_att: {
  title: "New User ATT",
  description:
    "Average talktime per new user on their first day of interaction.",
},

d0_earnings: {
  title: "New User Earnings",
  description:
    "Earnings generated from first-time users that day.",
},

dn_users: {
  title: "Repeat Users",
  description:
    "Unique repeat users who connected with you that day.",
},

dn_att: {
  title: "Repeat User ATT",
  description:
    "Average talktime per repeat user that day.",
},

dn_earnings: {
  title: "Repeat User Earnings",
  description:
    "Earnings generated from repeat users that day.",
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
      return `${Number(score).toFixed(1)}%`;
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

export function formatPeriodLabel(periodLabel?: string): string {
  if (!periodLabel) return "";

  return periodLabel
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export class DashboardApiError extends Error {
  constructor(
    message: string,
    public kind: "not_found" | "disabled" | "network",
  ) {
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
