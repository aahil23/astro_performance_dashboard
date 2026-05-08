import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { ExpertProfileCard } from "@/components/dashboard/ExpertProfileCard";
import { StatusLegend } from "@/components/dashboard/StatusLegend";
import { MetricSection } from "@/components/dashboard/MetricSection";
import { PerformanceMetricCard } from "@/components/dashboard/PerformanceMetricCard";
import { CompactMetricsTable } from "@/components/dashboard/CompactMetricsTable";
import { OnlineTimeSection } from "@/components/dashboard/OnlineTimeSection";
import { ImpactOfScoreCard } from "@/components/dashboard/ImpactOfScoreCard";
import { ErrorState } from "@/components/dashboard/States";
import {
  getDashboardData,
  groupMetricsBySection,
  SECTION_TITLES,
  type DashboardData,
} from "@/lib/dashboard-data";
import { session } from "@/lib/session";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getDashboardData()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(String(e)));
    return () => {
      active = false;
    };
  }, []);

  const logout = () => {
    session.logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen">
      <AppHeader title="Performance Dashboard" backTo="/" />
      <div className="mx-auto max-w-md px-4 pb-40 pt-4">
        {error && <ErrorState message={error} />}
        {!data && !error && <DashboardSkeleton />}
        {data && (
          <div className="space-y-6">
            <ExpertProfileCard expert={data.expert} onLogout={logout} />
            <StatusLegend />
            <DashboardSections data={data} />
          </div>
        )}
      </div>
      <ImpactOfScoreCard />
    </div>
  );
}

function DashboardSections({ data }: { data: DashboardData }) {
  const groups = groupMetricsBySection(data.metrics);
  return (
    <>
      <MetricSection title={SECTION_TITLES.critical_performance}>
        {groups.critical_performance.map((m) => (
          <PerformanceMetricCard key={m.metric_key} metric={m} />
        ))}
      </MetricSection>
      <MetricSection title={SECTION_TITLES.profile_performance}>
        {groups.profile_performance.map((m) => (
          <PerformanceMetricCard key={m.metric_key} metric={m} />
        ))}
      </MetricSection>
      <MetricSection title={SECTION_TITLES.availability_performance}>
        {groups.availability_performance.map((m) => (
          <PerformanceMetricCard key={m.metric_key} metric={m} />
        ))}
      </MetricSection>
      <MetricSection title={SECTION_TITLES.other_performance}>
        <CompactMetricsTable metrics={groups.other_performance} />
      </MetricSection>
      <MetricSection title={SECTION_TITLES.online_time}>
        <OnlineTimeSection metrics={groups.online_time} />
      </MetricSection>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}