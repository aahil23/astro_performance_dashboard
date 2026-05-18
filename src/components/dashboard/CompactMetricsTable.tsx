import type { ApiMetric } from "@/services/dashboardApi";
import {
  formatMetricValue,
  formatPeriodLabel,
  getMetricTitle,
} from "@/services/dashboardApi";
import { useRef } from "react";
import { useMetricViewLogger } from "@/hooks/useMetricViewLogger";

interface Props {
  metrics: ApiMetric[];
  scoreLabel?: string;
}

const getPriority = (key: string) => {
  const priorityMap: Record<string, number> = {
    earnings_l7: 1,
    earnings_l14: 2,
    earnings_l30: 3,
  };

  return priorityMap[key] ?? 999;
};

export function CompactMetricsTable({
  metrics,
  scoreLabel = "Score",
}: Props) {
  const sortedMetrics = [...metrics].sort(
    (a, b) => getPriority(a.metric_key) - getPriority(b.metric_key),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>Metric</span>
        <span className="text-right">{scoreLabel}</span>
        <span className="text-right">Rank</span>
      </div>

      {sortedMetrics.map((m, i) => (
        <CompactMetricRow
          key={m.metric_key}
          metric={m}
          isLast={i === sortedMetrics.length - 1}
        />
      ))}
    </div>
  );
}

function CompactMetricRow({
  metric,
  isLast,
}: {
  metric: ApiMetric;
  isLast: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const title = getMetricTitle(metric.metric_key);
  useMetricViewLogger(ref, {
    metric_key: metric.metric_key,
    metadata: {
      metric_title: title,
      score: metric.score,
      unit: metric.unit,
      rank: metric.rank,
      status: metric.status,
      period_label: metric.period_label,
      benchmark_bands: metric.benchmark_bands,
    },
  });

  return (
    <div
      ref={ref}
      className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-2.5 ${
        !isLast ? "border-b border-border/60" : ""
      }`}
    >
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>

        {metric.period_label && (
          <p className="text-[11px] text-muted-foreground">
            {formatPeriodLabel(metric.period_label)}
          </p>
        )}
      </div>

      <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">
        {formatMetricValue(metric.score, metric.unit)}
      </span>

      <span className="text-right text-xs text-foreground">
        {metric.rank !== null ? metric.rank.toLocaleString("en-IN") : "N/A"}
      </span>
    </div>
  );
}
