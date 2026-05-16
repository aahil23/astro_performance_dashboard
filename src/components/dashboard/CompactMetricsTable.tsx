import type { ApiMetric } from "@/services/dashboardApi";
import {
  formatMetricValue,
  getMetricTitle,
} from "@/services/dashboardApi";

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

      {sortedMetrics.map((m, i) => {
        const formattedPeriodLabel = m.period_label
          ?.replaceAll("_", " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return (
          <div
            key={m.metric_key}
            className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 ${
              i !== sortedMetrics.length - 1
                ? "border-b border-border/60"
                : ""
            }`}
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {getMetricTitle(m.metric_key)}
              </p>

              {formattedPeriodLabel && (
                <p className="text-[11px] text-muted-foreground">
                  {formattedPeriodLabel}
                </p>
              )}
            </div>

            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">
              {formatMetricValue(m.score, m.unit)}
            </span>

            <span className="text-right text-xs text-foreground">
              {m.rank !== null
                ? m.rank.toLocaleString("en-IN")
                : "N/A"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
