import type { Metric } from "@/lib/dashboard-data";
import { formatMetricValue, getStatusColor, getStatusLabel } from "@/lib/dashboard-data";
import { SegmentedBenchmarkBar } from "./SegmentedBenchmarkBar";

export function PerformanceMetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{metric.title}</h3>
          <p className="text-xs text-muted-foreground">{metric.period_label}</p>
        </div>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: getStatusColor(metric.status) }}
        >
          {getStatusLabel(metric.status)}
        </span>
      </div>
      <div className="mt-4">
        <SegmentedBenchmarkBar percentile={metric.percentile} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Your Score</span>
        <span className="font-semibold text-foreground">
          {formatMetricValue(metric.score, metric.unit)}
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{metric.description}</p>
      {metric.rank !== null && (
        <p className="mt-2 text-xs font-medium text-foreground">Rank: {metric.rank.toLocaleString("en-IN")}</p>
      )}
    </div>
  );
}