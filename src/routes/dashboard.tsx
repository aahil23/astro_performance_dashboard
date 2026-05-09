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
  type DashboardResponse,
  type SectionKey,
} from "@/services/dashboardApi";
import { dashboardStore } from "@/lib/dashboard-store";
import { session } from "@/lib/session";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardResponse | null>(() => dashboardStore.get());

  useEffect(() => {
    if (!data) navigate({ to: "/" });
  }, [data, navigate]);

  const logout = () => {
    dashboardStore.clear();
    session.logout();
    navigate({ to: "/" });
  };

  if (!data) return null;

  return (
    <div className="min-h-screen">
      <AppHeader title="Astro Performance Dashboard" backTo="/" />
      <div className="mx-auto max-w-md px-4 pb-40 pt-4">
        <div className="space-y-6">
          <ExpertProfileCard expert={data.expert} onLogout={logout} />
          <StatusLegend />
          <DashboardSections data={data} />
        </div>
      </div>
      <ImpactOfScoreCard />
    </div>
  );
}

const COMPACT_SECTIONS = new Set<SectionKey>([
  "earnings_overview",
  "engagement_overview",
]);

const SCORE_LABELS: Partial<Record<SectionKey, string>> = {
  earnings_overview: "Earnings",
  engagement_overview: "Value",
};

function DashboardSections({ data }: { data: DashboardResponse }) {
  return (
    <>
      {SECTION_ORDER.map((key) => {
        const metrics = data.metrics_by_section?.[key] ?? [];
        if (metrics.length === 0) return null;
        return (
          <MetricSection key={key} title={SECTION_TITLES[key]}>
            {COMPACT_SECTIONS.has(key) ? (
              <CompactMetricsTable metrics={metrics} scoreLabel={SCORE_LABELS[key]} />
            ) : (
              [...metrics]
  .sort((a, b) => {
    const priorityMap: Record<string, number> = {
      avg_chat_rating: 1,
      avg_audio_rating: 2,
      avg_video_rating: 3,

      chat_available_hours: 4,
      audio_available_hours: 5,
      video_available_hours: 6,
    };

    return (
      (priorityMap[a.metric_key] ?? 999) -
      (priorityMap[b.metric_key] ?? 999)
    );
  })
  .map((m) => (
    <PerformanceMetricCard
      key={m.metric_key}
      metric={m}
    />
  ))}
            )
          </MetricSection>
        );
      })}
    </>
  );
}
