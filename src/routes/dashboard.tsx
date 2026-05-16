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
import {
  SECTION_ORDER,
  SECTION_TITLES,
  type ApiMetric,
  type DashboardResponse,
  type SectionKey,
} from "@/services/dashboardApi";
import { dashboardStore } from "@/lib/dashboard-store";
import { session } from "@/lib/session";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

const ONLINE_TIME_COLOR = "#c4c7cf";
const BUSY_TIME_COLOR = "#f4511e";

const COMPACT_SECTIONS = new Set<SectionKey>(["earnings_overview"]);

const SCORE_LABELS: Partial<Record<SectionKey, string>> = {
  earnings_overview: "Earnings",
};

const getMetricPriority = (key: string) => {
  const priorityMap: Record<string, number> = {
    d0_ttpu: 1,
    d14_ttpu: 2,

    avg_chat_rating: 3,
    avg_audio_rating: 4,
    avg_video_rating: 5,

    chat_available_hours: 6,
    audio_available_hours: 7,
    video_available_hours: 8,

    chat_online_time_l7: 9,
    chat_busy_time_l7: 10,
    chat_utilisation_l7: 11,

    audio_online_time_l7: 12,
    audio_busy_time_l7: 13,
    audio_utilisation_l7: 14,

    video_online_time_l7: 15,
    video_busy_time_l7: 16,
    video_utilisation_l7: 17,

    earnings_l7: 18,
    earnings_l14: 19,
    earnings_l30: 20,
  };

  return priorityMap[key] ?? 999;
};

const sortMetrics = (metrics: ApiMetric[]) =>
  [...metrics].sort(
    (a, b) => getMetricPriority(a.metric_key) - getMetricPriority(b.metric_key),
  );

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(() =>
    dashboardStore.get(),
  );

  useEffect(() => {
    if (!data) navigate({ to: "/" });
  }, [data, navigate]);

  const logout = () => {
    dashboardStore.clear();
    session.logout();
    setData(null);
    navigate({ to: "/" });
  };

  if (!data) return null;

  const allMetrics = Object.values(data.metrics_by_section).flat();

  const lastUpdated = allMetrics
    .map((metric) => metric.updated_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];

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
          <MetricSection key={key} title={SECTION_TITLES[key]}>
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
