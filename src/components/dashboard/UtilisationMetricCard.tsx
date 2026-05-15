import type { ApiMetric } from "@/services/dashboardApi";
import { formatMetricValue, getStatusColor } from "@/services/dashboardApi";
import { SegmentedBenchmarkBar } from "./SegmentedBenchmarkBar";

interface Props {
  title: string;
  busyMetric: ApiMetric;
  onlineMetric: ApiMetric;
  showBenchmark: boolean;
}

export function UtilisationMetricCard({
  title,
  busyMetric,
  onlineMetric,
  showBenchmark,
}: Props) {
  const onlineScore = Number(onlineMetric.score) || 0;
  const busyScore = Number(busyMetric.score) || 0;

  const hasOnline = onlineScore > 0;
  const utilisationPct = hasOnline ? (busyScore / onlineScore) * 100 : 0;
  const fillPct = Math.min(100, Math.max(0, utilisationPct));

  const fillColor = busyMetric.status
    ? getStatusColor(busyMetric.status)
    : "var(--primary)";

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {busyMetric.period_label && (
            <p className="text-xs text-muted-foreground">{busyMetric.period_label}</p>
          )}
        </div>

        {showBenchmark && busyMetric.status && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: getStatusColor(busyMetric.status) }}
          >
            {busyMetric.status}
          </span>
        )}
      </div>

      {showBenchmark && busyMetric.benchmark_bands && (
        <div className="mt-4">
          <SegmentedBenchmarkBar
            bands={busyMetric.benchmark_bands}
            score={busyMetric.score}
            status={busyMetric.status}
          />
        </div>
      )}

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fillPct}%`, backgroundColor: fillColor }}
            aria-label="Busy vs Online"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Busy {formatMetricValue(busyMetric.score, busyMetric.unit)} / Online{" "}
          {formatMetricValue(onlineMetric.score, onlineMetric.unit)}
        </span>
        <span className="font-semibold text-foreground">
          {hasOnline ? `${utilisationPct.toFixed(1)}%` : "N/A"}
        </span>
      </div>

      {showBenchmark && busyMetric.rank !== null && (
        <p className="mt-2 text-xs font-medium text-foreground">
          Rank: {busyMetric.rank.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}