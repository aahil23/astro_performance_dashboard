import type { ApiMetric } from "@/services/dashboardApi";
import {
  formatMetricValue,
  getMetricDescription,
  getStatusColor,
} from "@/services/dashboardApi";
import { SegmentedBenchmarkBar } from "./SegmentedBenchmarkBar";

interface Props {
  title: string;
  busyMetric: ApiMetric;
  onlineMetric: ApiMetric;
  utilisationMetric?: ApiMetric;
  showBenchmark: boolean;
}

export function UtilisationMetricCard({
  title,
  busyMetric,
  onlineMetric,
  utilisationMetric,
  showBenchmark,
}: Props) {
  const onlineScore = Number(onlineMetric.score) || 0;
  const busyScore = Number(busyMetric.score) || 0;
  const hasOnline = onlineScore > 0;
  const benchmarkMetric = utilisationMetric ?? busyMetric;
  const description = getMetricDescription(benchmarkMetric.metric_key);
  const periodLabel =
    benchmarkMetric.period_label || busyMetric.period_label || onlineMetric.period_label;
  const utilisationScore = utilisationMetric
    ? Number(utilisationMetric.score)
    : hasOnline
      ? (busyScore / onlineScore) * 100
      : NaN;

  const busyFillPct = hasOnline
    ? Math.min(100, Math.max(0, (busyScore / onlineScore) * 100))
    : 0;

  const onlineFillPct = hasOnline ? 100 - busyFillPct : 0;

  const onlineColor = "var(--muted-foreground)";
  const busyColor = busyMetric.status
    ? getStatusColor(busyMetric.status)
    : "var(--primary)";

  const busyLabelLeft = Math.min(96, Math.max(4, busyFillPct));

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {title}
          </h3>

          {periodLabel && (
            <p className="text-xs text-muted-foreground">
              {periodLabel}
            </p>
          )}
        </div>

        {showBenchmark && benchmarkMetric.status && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{
              backgroundColor: getStatusColor(benchmarkMetric.status),
            }}
          >
            {benchmarkMetric.status}
          </span>
        )}
      </div>

      {showBenchmark && benchmarkMetric.benchmark_bands && (
        <div className="mt-4">
          <SegmentedBenchmarkBar
            bands={benchmarkMetric.benchmark_bands}
            score={benchmarkMetric.score}
            status={benchmarkMetric.status}
          />
        </div>
      )}

      <div className="mt-4">
        <p className="mb-1 text-[10px] font-medium text-muted-foreground">
          Busy Time vs Online Time
        </p>

        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full transition-all"
            style={{
              width: `${busyFillPct}%`,
              backgroundColor: busyColor,
            }}
            aria-label="Busy time"
          />

          <div
            className="h-full transition-all"
            style={{
              width: `${onlineFillPct}%`,
              backgroundColor: onlineColor,
            }}
            aria-label="Online time excluding busy time"
          />
        </div>

        <div className="relative mt-1 h-5 text-[10px] text-muted-foreground">
          <span
            className="absolute whitespace-nowrap tabular-nums"
            style={{
              left: `${busyLabelLeft}%`,
              transform: "translateX(-50%)",
            }}
          >
            {formatMetricValue(busyMetric.score, busyMetric.unit)}
          </span>

          <span className="absolute right-0 whitespace-nowrap tabular-nums">
            {formatMetricValue(onlineMetric.score, onlineMetric.unit)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Your Utilisation</span>

        <span className="font-semibold text-foreground">
          {Number.isFinite(utilisationScore)
            ? `${utilisationScore.toFixed(1)}%`
            : "N/A"}
        </span>
      </div>

      {description && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {showBenchmark && benchmarkMetric.rank !== null && (
        <p className="mt-2 text-xs font-medium text-foreground">
          Rank: {benchmarkMetric.rank.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
