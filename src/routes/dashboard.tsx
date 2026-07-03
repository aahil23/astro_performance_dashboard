import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { ExpertProfileCard } from "@/components/dashboard/ExpertProfileCard";
import { StatusLegend } from "@/components/dashboard/StatusLegend";
import { MetricSection } from "@/components/dashboard/MetricSection";
import { PerformanceMetricCard } from "@/components/dashboard/PerformanceMetricCard";
import { CompactMetricsTable } from "@/components/dashboard/CompactMetricsTable";
import { UtilisationMetricCard } from "@/components/dashboard/UtilisationMetricCard";
import { ImpactOfScoreCard } from "@/components/dashboard/ImpactOfScoreCard";
import { WeeklyFunnelTrends } from "@/components/dashboard/WeeklyFunnelTrends";
import {
  SECTION_ORDER,
  SECTION_TITLES,
  type ApiMetric,
  type DashboardResponse,
  type SectionKey,
} from "@/services/dashboardApi";
import { dashboardStore } from "@/lib/dashboard-store";
import { session } from "@/lib/session";
import {
  endSession,
  hasLoggedSessionStarted,
  logAnalyticsEvent,
  markSessionStartedLogged,
  registerInactivityLogoutHandler,
  startSession,
} from "@/services/analytics";

declare module "@tanstack/react-router" {
  interface HistoryState {
    message?: string;
  }
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const ONLINE_TIME_COLOR = "#BFE4FA";
const BUSY_TIME_COLOR = "#3E8FB0";

const COMPACT_SECTIONS = new Set<SectionKey>(["earnings_overview"]);

const SCORE_LABELS: Partial<Record<SectionKey, string>> = {
  earnings_overview: "Earnings",
};

const ANALYTICS_METRIC_KEYS = [
  "d0_ttpu",
  "d14_ttpu",
  "d14_d0_growth",
  "earnings_l7",
  "earnings_l14",
  "earnings_l30",
  "chat_utilisation_l7",
  "audio_utilisation_l7",
];

const getMetricPriority = (key: string) => {
  const priorityMap: Record<string, number> = {
    d0_ttpu: 1,
    d14_ttpu: 2,
    d14_d0_growth: 3,

    avg_chat_rating: 4,
    avg_audio_rating: 5,
    avg_video_rating: 6,

    chat_available_hours: 7,
    audio_available_hours: 8,
    video_available_hours: 9,

    chat_online_time_l7: 10,
    chat_busy_time_l7: 11,
    chat_utilisation_l7: 12,

    audio_online_time_l7: 13,
    audio_busy_time_l7: 14,
    audio_utilisation_l7: 15,

    video_online_time_l7: 16,
    video_busy_time_l7: 17,
    video_utilisation_l7: 18,

    earnings_l7: 19,
    earnings_l14: 20,
    earnings_l30: 21,
  };

  return priorityMap[key] ?? 999;
};

const sortMetrics = (metrics: ApiMetric[]) =>
  [...metrics].sort(
    (a, b) => getMetricPriority(a.metric_key) - getMetricPriority(b.metric_key),
  );

function formatDashboardDate(timestampMs: number): string {
  return new Intl.DateTimeFormat("en-IN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .format(timestampMs)
    .replace(",", " •")
    .replace("am", "AM")
    .replace("pm", "PM");
}

function getLastUpdated(metrics: ApiMetric[]): string | undefined {
  const timestamps = metrics
    .map((metric) => metric.updated_at_timestamp_ms)
    .filter((timestamp): timestamp is number => typeof timestamp === "number")
    .sort((a, b) => b - a);

  return timestamps[0] ? formatDashboardDate(timestamps[0]) : undefined;
}

function buildMetricSnapshot(data: DashboardResponse) {
  const allMetrics = Object.values(data.metrics_by_section).flat();
  const byKey = new Map(allMetrics.map((m) => [m.metric_key, m]));

  return ANALYTICS_METRIC_KEYS.reduce<Record<string, unknown>>((acc, key) => {
    const metric = byKey.get(key);

    acc[key] = metric
      ? {
          score: metric.score,
          rank: metric.rank,
        }
      : null;

    return acc;
  }, {});
}

function buildWeeklyFunnelAverages(data: DashboardResponse) {
  const trends = data.weekly_funnel_trends;

  if (!trends?.funnels) return null;

  const averages: Record<string, number | null> = {};

  trends.funnels.forEach((funnel) => {
    funnel.metrics.forEach((metric) => {
      averages[`${metric.metric_key}_avg`] = metric.weekly_average ?? null;
    });
  });

  return averages;
}

function buildSessionStartedMetadata(data: DashboardResponse) {
  return {
    expert_name: data.expert.name,
    selected_metrics: buildMetricSnapshot(data),
    weekly_funnel_averages: buildWeeklyFunnelAverages(data),
  };
}

function DashboardPage() {
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardResponse | null>(() =>
    dashboardStore.get(),
  );

  useEffect(() => {
    if (!data) navigate({ to: "/" });
  }, [data, navigate]);

  useEffect(() => {
    registerInactivityLogoutHandler(() => {
      dashboardStore.clear();
      session.logout();
      setData(null);

      navigate({
        to: "/",
        state: {
          message: "Your session ended due to inactivity. Please login again.",
        },
      });
    });
  }, [navigate]);

  useEffect(() => {
    if (!data || hasLoggedSessionStarted()) return;

    const sessionId = startSession({
      expert_id: String(data.expert.expert_id),
      phone_number: String(data.expert.phone_number),
    });

    void logAnalyticsEvent({
      event_name: "session_started",
      session_id: sessionId,
      expert_id: String(data.expert.expert_id),
      phone_number: String(data.expert.phone_number),
      metadata: buildSessionStartedMetadata(data),
    });

    markSessionStartedLogged();
  }, [data]);

  const logout = () => {
    endSession("logout");
    dashboardStore.clear();
    session.logout();
    setData(null);
    navigate({ to: "/" });
  };

  if (!data) return null;

  const allMetrics = Object.values(data.metrics_by_section).flat();
  const lastUpdated = getLastUpdated(allMetrics);

  return (
    <div className="min-h-screen">
      <AppHeader title="Astro Performance Dashboard" backTo="/" />

      <div className="mx-auto max-w-md px-4 pb-40 pt-4">
        <div className="space-y-6">
          <ExpertProfileCard
            expert={data.expert}
            onLogout={logout}
            lastUpdated={lastUpdated}
          />

          <StatusLegend />

          <DashboardSections data={data} />
        </div>
      </div>

      <ImpactOfScoreCard />
    </div>
  );
}

function DashboardSections({ data }: { data: DashboardResponse }) {
  return (
    <>
      {SECTION_ORDER.map((key) => {
        const metrics = data.metrics_by_section?.[key] ?? [];

        if (metrics.length === 0) return null;

        const sortedMetrics = sortMetrics(metrics);

        return (
          <div key={key} className="space-y-6">
            <MetricSection title={SECTION_TITLES[key]}>
              {key === "engagement_overview" ? (
                <UtilisationSection metrics={sortedMetrics} />
              ) : COMPACT_SECTIONS.has(key) ? (
                <CompactMetricsTable
                  metrics={sortedMetrics}
                  scoreLabel={SCORE_LABELS[key]}
                />
              ) : (
                sortedMetrics.map((metric) => (
                  <PerformanceMetricCard
                    key={metric.metric_key}
                    metric={metric}
                  />
                ))
              )}
            </MetricSection>

            {key === "earnings_overview" && data.weekly_funnel_trends && (
              <WeeklyFunnelTrends data={data.weekly_funnel_trends} />
            )}
          </div>
        );
      })}
    </>
  );
}

const UTILISATION_PAIRS: Array<{
  title: string;
  busyKey: string;
  onlineKey: string;
  utilisationKey: string;
  showBenchmark: boolean;
}> = [
  {
    title: "Chat Utilisation",
    busyKey: "chat_busy_time_l7",
    onlineKey: "chat_online_time_l7",
    utilisationKey: "chat_utilisation_l7",
    showBenchmark: true,
  },
  {
    title: "Audio Utilisation",
    busyKey: "audio_busy_time_l7",
    onlineKey: "audio_online_time_l7",
    utilisationKey: "audio_utilisation_l7",
    showBenchmark: true,
  },
  {
    title: "Video Utilisation",
    busyKey: "video_busy_time_l7",
    onlineKey: "video_online_time_l7",
    utilisationKey: "video_utilisation_l7",
    showBenchmark: true,
  },
];

function UtilisationSection({ metrics }: { metrics: ApiMetric[] }) {
  const byKey = new Map(metrics.map((m) => [m.metric_key, m]));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 px-1 pb-1">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: ONLINE_TIME_COLOR }}
          />
          <span className="text-xs text-muted-foreground">Online Time</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: BUSY_TIME_COLOR }}
          />
          <span className="text-xs text-muted-foreground">Busy Time</span>
        </div>
      </div>

      {UTILISATION_PAIRS.map((pair) => {
        const busy = byKey.get(pair.busyKey);
        const online = byKey.get(pair.onlineKey);
        const utilisation = byKey.get(pair.utilisationKey);

        if (!busy || !online || !utilisation) return null;

        return (
          <UtilisationMetricCard
            key={pair.title}
            title={pair.title}
            busyMetric={busy}
            onlineMetric={online}
            utilisationMetric={utilisation}
            showBenchmark={pair.showBenchmark}
          />
        );
      })}
    </div>
  );
}
