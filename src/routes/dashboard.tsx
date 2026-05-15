import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { ExpertProfileCard } from "@/components/dashboard/ExpertProfileCard";
import { StatusLegend } from "@/components/dashboard/StatusLegend";
import { MetricSection } from "@/components/dashboard/MetricSection";
import { PerformanceMetricCard } from "@/components/dashboard/PerformanceMetricCard";
import { CompactMetricsTable } from "@/components/dashboard/CompactMetricsTable";
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

const COMPACT_SECTIONS = new Set<SectionKey>([
  "earnings_overview",
  "engagement_overview",
]);

const SCORE_LABELS: Partial<Record<SectionKey, string>> = {
  earnings_overview: "Earnings",
  engagement_overview: "Value",
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

    audio_online_time_l7: 11,
    audio_busy_time_l7: 12,

    video_online_time_l7: 13,
    video_busy_time_l7: 14,

    earnings_l7: 15,
    earnings_l14: 16,
    earnings_l30: 17,
  };

  return priorityMap[key] ?? 999;
};

const sortMetrics = (metrics: ApiMetric[]) =>
  [...metrics].sort(
    (a, b) => getMetricPriority(a.metric_key) - getMetricPriority(b.metric_key)
  );

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(() =>
    dashboardStore.get()
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
            {COMPACT_SECTIONS.has(key) ? (
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
