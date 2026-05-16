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
  utilisationMetric: ApiMetric;
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
  const utilisationScore = Number(utilisationMetric.score);

  const hasOnline = onlineScore > 0;

  const description = getMetricDescription(utilisationMetric.metric_key);

  const periodLabel =
    utilisationMetric.period_label ||
    busyMetric.period_label ||
    onlineMetric.period_label;

  const formattedPeriodLabel = periodLabel
    ?.replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const busyFillPct = hasOnline
    ? Math.min(100, Math.max(0, (busyScore / onlineScore) * 100))
    : 0;

  const onlineFillPct = hasOnline ? 100 - busyFillPct : 0;

  const onlineColor = "#7FC8F8";
const busyColor = "#5AA9E6";

  const busyLabelLeft = Math.min(96, Math.max(4, busyFillPct));

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

        {showBenchmark && utilisationMetric.status && (
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{
              backgroundColor: getStatusColor(utilisationMetric.status),
            }}
          >
            {utilisationMetric.status}
          </span>
        )}
      </div>

      {showBenchmark && utilisationMetric.benchmark_bands && (
        <div className="mt-4">
          <SegmentedBenchmarkBar
            bands={utilisationMetric.benchmark_bands}
            score={Number(utilisationMetric.score)}
            status={utilisationMetric.status}
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Your Utilisation</span>

        <span className="font-semibold text-foreground">
          {Number.isFinite(utilisationScore)
            ? `${utilisationScore.toFixed(1)}%`
            : "N/A"}
        </span>
      </div>

      <div className="mt-3">
        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Busy vs Online
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

      {description && (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      {showBenchmark && utilisationMetric.rank !== null && (
        <p className="mt-2 text-xs font-medium text-foreground">
          Rank: {utilisationMetric.rank.toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}
