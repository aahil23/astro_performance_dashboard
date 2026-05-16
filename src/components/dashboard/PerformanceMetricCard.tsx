import type { ApiMetric } from "@/services/dashboardApi";
import {
  formatMetricValue,
  formatPeriodLabel,
  getMetricDescription,
  getMetricTitle,
  getStatusColor,
} from "@/services/dashboardApi";
import { SegmentedBenchmarkBar } from "./SegmentedBenchmarkBar";

export function PerformanceMetricCard({ metric }: { metric: ApiMetric }) {
  const title = getMetricTitle(metric.metric_key);
  const description = getMetricDescription(metric.metric_key);
  const formattedPeriodLabel = formatPeriodLabel(metric.period_label);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {title}
          </h3>

          {formattedPeriodLabel && (
            <p className="text-xs text-muted-foreground">
              {formattedPeriodLabel}
            </p>
          )}
        </div>

        {metric.status && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: getStatusColor(metric.status) }}
          >
            {metric.status}
          </span>
        )}
      </div>

      {metric.benchmark_bands && (
        <div className="mt-4">
          <SegmentedBenchmarkBar
            bands={metric.benchmark_bands}
            score={metric.score}
            status={metric.status}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Your Score</span>

        <span className="font-semibold text-foreground">
          {formatMetricValue(metric.score, metric.unit)}
        </span>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {metric.rank !== null && (
        <p className="mt-2 text-xs font-medium text-foreground">
          Rank: {metric.rank.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
