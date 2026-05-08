import type { Metric } from "@/lib/dashboard-data";
import { formatMetricValue, getStatusColor, getStatusLabel } from "@/lib/dashboard-data";

export function CompactMetricsTable({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 border-b border-border/60 bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground">
        <span>Metric</span>
        <span className="text-right">Earnings</span>
        <span className="text-right">Rank</span>
        <span className="text-right">Status</span>
      </div>
      {metrics.map((m, i) => (
        <div
          key={m.metric_key}
          className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 ${
            i !== metrics.length - 1 ? "border-b border-border/60" : ""
          }`}
        >
          <div>
            <p className="text-sm font-medium text-foreground">{m.title}</p>
            <p className="text-[11px] text-muted-foreground">{m.period_label}</p>
          </div>
          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-foreground">
            {formatMetricValue(m.score, m.unit)}
          </span>
          <span className="text-right text-xs text-foreground">
            {m.rank !== null ? m.rank.toLocaleString("en-IN") : "N/A"}
          </span>
          <span
            className="text-right text-xs font-medium"
            style={{ color: getStatusColor(m.status) }}
          >
            {getStatusLabel(m.status)}
          </span>
        </div>
      ))}
    </div>
  );
}