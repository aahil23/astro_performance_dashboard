export type MetricStatus = "bad" | "average" | "good" | "excellent" | "na";
export type MetricSection =
  | "critical_performance"
  | "profile_performance"
  | "availability_performance"
  | "other_performance"
  | "online_time";

export interface Metric {
  metric_key: string;
  section: MetricSection;
  title: string;
  period_label: string;
  score: number;
  unit: string;
  benchmark: number | null;
  rank: number | null;
  status: MetricStatus;
  description: string;
  display_order: number;
}

export interface Expert {
  expert_id: string;
  name: string;
  phone_number: string;
  languages: string[];
  primary_language: string;
}

export interface DashboardData {
  expert: Expert;
  metrics: Metric[];
  meta: {
    generated_at: string;
    ranking_scope: string;
    primary_language_precedence: string[];
  };
}

export const mockDashboardData: DashboardData = {
  expert: {
    expert_id: "EXP12345",
    name: "Lokal Aahil",
    phone_number: "+91 9049675788",
    languages: ["Hindi", "Tamil"],
    primary_language: "Hindi",
  },
  metrics: [
    { metric_key: "d0_ttpu_latest_200", section: "critical_performance", title: "D0 TTPU (Latest 200)", period_label: "Latest 200", score: 82, unit: "%", benchmark: 90, rank: 1200, status: "average", description: "D0 TTPU shows short-term user conversion performance from the latest 200 eligible users.", display_order: 1 },
    { metric_key: "d14_ttpu_latest_200", section: "critical_performance", title: "D14 TTPU (Latest 200)", period_label: "Latest 200", score: 77, unit: "%", benchmark: 85, rank: 1450, status: "average", description: "D14 TTPU shows longer-term user conversion performance from the latest 200 eligible users.", display_order: 2 },
    { metric_key: "avg_rating_chat_paid_l90", section: "profile_performance", title: "Average Rating Chat (Paid)", period_label: "L90 Days", score: 4.82, unit: "rating", benchmark: 4.75, rank: 3458, status: "good", description: "Average rating received from paid chat consultations in the last 90 days.", display_order: 3 },
    { metric_key: "avg_rating_audio_paid_l90", section: "profile_performance", title: "Average Rating Audio (Paid)", period_label: "L90 Days", score: 4.6, unit: "rating", benchmark: 4.75, rank: 7000, status: "average", description: "Average rating received from paid audio consultations in the last 90 days.", display_order: 4 },
    { metric_key: "avg_rating_video_paid_l90", section: "profile_performance", title: "Average Rating Video (Paid)", period_label: "L90 Days", score: 4.9, unit: "rating", benchmark: 4.75, rank: 2100, status: "excellent", description: "Average rating received from paid video consultations in the last 90 days.", display_order: 5 },
    { metric_key: "chat_hours_l7", section: "availability_performance", title: "Chat (Hrs) (L7)", period_label: "L7", score: 6.5, unit: "hrs", benchmark: 8, rank: null, status: "average", description: "Average chat availability in hours over the last 7 days.", display_order: 6 },
    { metric_key: "call_hours_l7", section: "availability_performance", title: "Call (Hrs) (L7)", period_label: "L7", score: 0, unit: "hrs", benchmark: 8, rank: null, status: "bad", description: "Average call availability in hours over the last 7 days.", display_order: 7 },
    { metric_key: "video_hours_l7", section: "availability_performance", title: "Video (Hrs) (L7)", period_label: "L7", score: 2.5, unit: "hrs", benchmark: 8, rank: null, status: "bad", description: "Average video availability in hours over the last 7 days.", display_order: 8 },
    { metric_key: "earnings_l7", section: "other_performance", title: "Last 7 Days Earnings", period_label: "L7", score: 138, unit: "₹", benchmark: null, rank: 13289, status: "na", description: "Total earnings in the last 7 days.", display_order: 9 },
    { metric_key: "earnings_l14", section: "other_performance", title: "Last 14 Days Earnings", period_label: "L14", score: 620, unit: "₹", benchmark: null, rank: 11800, status: "na", description: "Total earnings in the last 14 days.", display_order: 10 },
    { metric_key: "earnings_l30", section: "other_performance", title: "Last 30 Days Earnings", period_label: "L30", score: 1420, unit: "₹", benchmark: null, rank: 9800, status: "na", description: "Total earnings in the last 30 days.", display_order: 11 },
    { metric_key: "chat_busy_time_l7", section: "online_time", title: "Chat Busy Time", period_label: "L7", score: 8.17, unit: "mins", benchmark: null, rank: null, status: "na", description: "Busy time for chat in the last 7 days.", display_order: 12 },
    { metric_key: "chat_online_time_l7", section: "online_time", title: "Chat Online Time", period_label: "L7", score: 13.68, unit: "mins", benchmark: null, rank: null, status: "na", description: "Online time for chat in the last 7 days.", display_order: 13 },
    { metric_key: "audio_busy_time_l7", section: "online_time", title: "Audio Busy Time", period_label: "L7", score: 0, unit: "mins", benchmark: null, rank: null, status: "na", description: "Busy time for audio in the last 7 days.", display_order: 14 },
    { metric_key: "audio_online_time_l7", section: "online_time", title: "Audio Online Time", period_label: "L7", score: 0, unit: "mins", benchmark: null, rank: null, status: "na", description: "Online time for audio in the last 7 days.", display_order: 15 },
    { metric_key: "video_busy_time_l7", section: "online_time", title: "Video Busy Time", period_label: "L7", score: 0, unit: "mins", benchmark: null, rank: null, status: "na", description: "Busy time for video in the last 7 days.", display_order: 16 },
    { metric_key: "video_online_time_l7", section: "online_time", title: "Video Online Time", period_label: "L7", score: 0, unit: "mins", benchmark: null, rank: null, status: "na", description: "Online time for video in the last 7 days.", display_order: 17 },
  ],
  meta: {
    generated_at: "2026-05-07T04:00:00Z",
    ranking_scope: "primary_language_wise",
    primary_language_precedence: ["Hindi", "Tamil", "Malayalam", "Telugu"],
  },
};

export async function getDashboardData(): Promise<DashboardData> {
  await new Promise((r) => setTimeout(r, 1700));
  return mockDashboardData;
}

export async function validateRegisteredMobileNumber(_mobileNumber: string): Promise<boolean> {
  return true;
}

export function groupMetricsBySection(metrics: Metric[]): Record<MetricSection, Metric[]> {
  const groups: Record<MetricSection, Metric[]> = {
    critical_performance: [],
    profile_performance: [],
    availability_performance: [],
    other_performance: [],
    online_time: [],
  };
  for (const m of [...metrics].sort((a, b) => a.display_order - b.display_order)) {
    groups[m.section].push(m);
  }
  return groups;
}

export function formatMetricValue(score: number, unit: string): string {
  if (unit === "₹") return `₹${score.toLocaleString("en-IN")}`;
  if (unit === "%") return `${score}%`;
  if (unit === "rating") return score.toFixed(2);
  if (unit === "hrs") return `${score} hrs`;
  if (unit === "mins") return `${score} mins`;
  return `${score} ${unit}`;
}

export function getStatusLabel(status: MetricStatus): string {
  return { bad: "Poor", average: "Average", good: "Good", excellent: "Excellent", na: "N/A" }[status];
}

export function getStatusColor(status: MetricStatus): string {
  return {
    bad: "var(--status-poor)",
    average: "var(--status-average)",
    good: "var(--status-good)",
    excellent: "var(--status-excellent)",
    na: "var(--status-na)",
  }[status];
}

export const SECTION_TITLES: Record<MetricSection, string> = {
  critical_performance: "Critical Performance Parameters",
  profile_performance: "Profile Performance",
  availability_performance: "Average Availability",
  other_performance: "Other Performance",
  online_time: "Online Time",
};