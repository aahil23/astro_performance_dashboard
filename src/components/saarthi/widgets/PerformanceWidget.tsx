import { WidgetShell } from "../WidgetShell";
import { formatDuration } from "@/services/saarthiApi";
import type { SaarthiPerformance, SaarthiPerformanceMetric } from "@/types/saarthi";

interface Props {
  performance?: SaarthiPerformance | null;
}

export function PerformanceWidget({ performance }: Props) {
  const metrics = performance?.metrics ?? [];
  if (!metrics.length) return null;

  const featuredKey = performance?.featuredKey;
  const featured = featuredKey
    ? metrics.find((m) => m.key === featuredKey)
    : metrics[0];
  const rest = metrics.filter((m) => m.key !== featured?.key);

  return (
    <WidgetShell title="Performance" subtitle="Today vs recent trend">
      {featured && <FeaturedRow metric={featured} />}
      {rest.length > 0 && (
        <div className="mt-3 space-y-2">
          {rest.map((m) => (
            <MetricRow key={m.key} metric={m} />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

function fmt(m: SaarthiPerformanceMetric, v: number | string | null | undefined) {
  return formatDuration(v, m.format);
}

function statusColor(status?: string | null) {
  switch (status) {
    case "elite":
    case "strong":
      return "text-status-strong";
    case "stable":
    case "average":
      return "text-status-stable";
    case "weak":
    case "critical":
      return "text-status-critical";
    default:
      return "text-muted-foreground";
  }
}

function FeaturedRow({ metric }: { metric: SaarthiPerformanceMetric }) {
  return (
    <div className="rounded-xl bg-primary/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">
          {metric.label ?? metric.key}
        </p>
        {metric.status && (
          <span className={`text-[11px] font-semibold uppercase ${statusColor(metric.status)}`}>
            {metric.status}
          </span>
        )}
      </div>
      <p className="mt-1 text-xl font-bold tracking-tight text-foreground">
        {fmt(metric, metric.today)}
      </p>
      <div className="mt-1 flex gap-3 text-[11px] text-muted-foreground">
        <span>Yday {fmt(metric, metric.yesterday)}</span>
        <span>7d {fmt(metric, metric.average7d)}</span>
        {metric.target !== undefined && metric.target !== null && (
          <span>Target {fmt(metric, metric.target)}</span>
        )}
      </div>
    </div>
  );
}

function MetricRow({ metric }: { metric: SaarthiPerformanceMetric }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-foreground">
          {metric.label ?? metric.key}
        </p>
        <p className="text-[11px] text-muted-foreground">
          Yday {fmt(metric, metric.yesterday)} · 7d {fmt(metric, metric.average7d)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-foreground">
          {fmt(metric, metric.today)}
        </p>
        {metric.status && (
          <p className={`text-[10px] font-medium uppercase ${statusColor(metric.status)}`}>
            {metric.status}
          </p>
        )}
      </div>
    </div>
  );
}