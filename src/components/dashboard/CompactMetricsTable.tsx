import type { ApiMetric } from "@/services/dashboardApi";
import { formatMetricValue, getMetricTitle } from "@/services/dashboardApi";

interface Props {
  metrics: ApiMetric[];
  scoreLabel?: string;
}

export function CompactMetricsTable({ metrics, scoreLabel = "Score" }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>Metric</span>
        <span className="text-right">{scoreLabel}</span>
        <span className="text-right">Rank</span>
      </div>
      {[...metrics]
        .sort((a, b) => {
    const getPriority = (key: string) => {
      if (key.startsWith("chat")) return 1;
      if (key.startsWith("avg_chat")) return 1;

      if (key.startsWith("audio")) return 2;
      if (key.startsWith("avg_audio")) return 2;

      if (key.startsWith("video")) return 3;
      if (key.startsWith("avg_video")) return 3;

      return 999;
    };

    return getPriority(a.metric_key) - getPriority(b.metric_key);
  })
        .map((m, i) => (
        <div
          key={m.metric_key}
          className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3 ${
            i !== metrics.length - 1 ? "border-b border-border/60" : ""
          }`}
        >
          <div>
            <p className="text-sm font-medium text-foreground">{getMetricTitle(m.metric_key)}</p>
            {m.period_label && (
              <p className="text-[11px] text-muted-foreground">{m.period_label}</p>
            )}
          </div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">
            {formatMetricValue(m.score, m.unit)}
          </span>
          <span className="text-right text-xs text-foreground">
            {m.rank !== null ? m.rank.toLocaleString("en-IN") : "N/A"}
          </span>
        </div>
      ))}
    </div>
  );
}
