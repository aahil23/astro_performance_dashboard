import type { ApiMetric } from "@/services/dashboardApi";
import {
  formatMetricValue,
  getMetricDescription,
  getStatusColor,
} from "@/services/dashboardApi";
import { SegmentedBenchmarkBar } from "./SegmentedBenchmarkBar";
import { useRef } from "react";
import { useMetricViewLogger } from "@/hooks/useMetricViewLogger";

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

  const cardRef = useRef<HTMLDivElement | null>(null);
  useMetricViewLogger(cardRef, {
    metric_key: utilisationMetric?.metric_key ?? "",
    metadata: {
      metric_title: title,
      score: utilisationMetric?.score,
      unit: utilisationMetric?.unit,
      rank: utilisationMetric?.rank,
      status: utilisationMetric?.status,
      period_label: utilisationMetric?.period_label,
      benchmark_bands: utilisationMetric?.benchmark_bands,
      busy_metric_key: busyMetric.metric_key,
      busy_score: busyMetric.score,
      busy_unit: busyMetric.unit,
      online_metric_key: onlineMetric.metric_key,
      online_score: onlineMetric.score,
      online_unit: onlineMetric.unit,
    },
    enabled: Boolean(utilisationMetric?.metric_key),
  });

  const busyFillPct = hasOnline
    ? Math.min(100, Math.max(0, (busyScore / onlineScore) * 100))
    : 0;

  const onlineFillPct = hasOnline ? 100 - busyFillPct : 0;

  const busyColor = "#3E8FB0";
  const onlineColor = "#BFE4FA";

  const busyLabelLeft = Math.min(96, Math.max(4, busyFillPct));

  // Dynamic label positions
  const busyTextPosition = busyFillPct / 2;
  const onlineTextPosition = busyFillPct + onlineFillPct / 2;

  return (
    <div
      ref={cardRef}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm"
    >
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

      <div className="mt-2">
        <div className="relative mb-0.5 h-3 text-[9px] font-medium text-muted-foreground">
          {busyFillPct >= 12 && (
            <span
              className="absolute whitespace-nowrap"
              style={{
                left: `${busyTextPosition}%`,
                transform: "translateX(-50%)",
              }}
            >
              Busy
            </span>
          )}

          {onlineFillPct >= 12 && (
            <span
              className="absolute whitespace-nowrap"
              style={{
                left: `${onlineTextPosition}%`,
                transform: "translateX(-50%)",
              }}
            >
              Online
            </span>
          )}
        </div>

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

        <div className="relative mt-0.5 h-4 text-[10px] text-muted-foreground">
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
