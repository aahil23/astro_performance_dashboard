import { WidgetShell } from "../WidgetShell";
import type {
  SaarthiPerformance,
  SaarthiPerformanceMetric,
} from "@/types/saarthi";

interface Props {
  performance?: SaarthiPerformance | null;
  size?: "small" | "medium" | "large";
}

const METRIC_ORDER = [
  "talk_time",
  "pickup",
  "availability",
  "repeat",
  "loyal",
  "rating",
];

const TARGET_BASED_METRICS = new Set([
  "talk_time",
  "pickup",
  "availability",
]);

export function PerformanceWidget({ performance }: Props) {
  const sourceMetrics = performance?.metrics ?? [];
  const metrics = METRIC_ORDER.map((key) =>
    sourceMetrics.find((metric) => metric.key === key),
  ).filter((metric): metric is SaarthiPerformanceMetric => Boolean(metric));

  if (metrics.length === 0) return null;

  return (
    <WidgetShell title="Performance" subtitle="Today vs target or recent trend">
      <div className="grid grid-cols-3 gap-2">
        {metrics.slice(0, 6).map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </div>
    </WidgetShell>
  );
}

function MetricCard({ metric }: { metric: SaarthiPerformanceMetric }) {
  const isTargetBased =
    TARGET_BASED_METRICS.has(metric.key) && hasValue(metric.target);

  const today = formatMetricValue(metric.today, metric.format);
  const comparisonLabel = isTargetBased ? "T" : "Y";
  const comparisonValue = isTargetBased ? metric.target : metric.yesterday;
  const comparison = formatMetricValue(comparisonValue, metric.format);
  const average7d = formatMetricValue(metric.average7d, metric.format);
  const status = formatStatus(metric.status);

  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-muted/20 px-2.5 py-2.5">
      <p className="truncate text-[11px] font-semibold text-muted-foreground">
        {getCompactLabel(metric)}
      </p>

      <p className="mt-1 truncate text-base font-bold leading-none text-foreground">
        {today}
      </p>

      <div className="mt-1.5 space-y-0.5 text-[10px] leading-3 text-muted-foreground">
        <p className="whitespace-nowrap">
          <span className="font-medium text-blue-600">{comparisonLabel}</span>{" "}
          <span className="font-semibold">{comparison}</span>
        </p>

        <p className="whitespace-nowrap">
          <span className="font-medium text-blue-600">7D</span>{" "}
          <span className="font-semibold">{average7d}</span>
        </p>
      </div>

      <p
        className={`mt-1.5 min-h-3 truncate text-[10px] font-semibold leading-3 ${getStatusClass(
          metric.status,
        )}`}
      >
        {status}
      </p>
    </div>
  );
}

function getCompactLabel(metric: SaarthiPerformanceMetric): string {
  const labels: Record<string, string> = {
    talk_time: "Talk Time",
    pickup: "Pickup",
    availability: "Online",
    repeat: "Repeat",
    loyal: "Loyal",
    rating: "Rating",
  };

  return labels[metric.key] || metric.label || metric.key;
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  return Number.isFinite(Number(value));
}

function formatMetricValue(
  value: unknown,
  format: SaarthiPerformanceMetric["format"],
): string {
  if (!hasValue(value)) return "—";

  const numericValue = Number(value);

  switch (format) {
    case "seconds":
      return formatSeconds(numericValue);
    case "minutes":
      return formatMinutes(numericValue);
    case "percent":
      return `${formatNumber(numericValue)}%`;
    case "count":
      return `${formatNumber(numericValue)} users`;
    case "inr":
      return formatCurrency(numericValue);
    case "number":
    default:
      return formatNumber(numericValue);
  }
}

function formatSeconds(value: number): string {
  const seconds = Math.max(0, Math.round(value));
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatMinutes(value: number): string {
  const minutes = Math.max(0, Math.round(value));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatStatus(status: unknown): string {
  const normalized = String(status || "").trim().toLowerCase();

  const labels: Record<string, string> = {
    above_target: "Above target",
    improving: "Improving",
    stable: "On track",
    needs_attention: "Needs attention",
    insufficient_data: "Not enough data",
  };

  return labels[normalized] || "Not enough data";
}

function getStatusClass(status: unknown): string {
  const normalized = String(status || "").trim().toLowerCase();

  const classes: Record<string, string> = {
    above_target: "text-emerald-600",
    improving: "text-blue-600",
    stable: "text-amber-600",
    needs_attention: "text-orange-600",
    insufficient_data: "text-muted-foreground",
  };

  return classes[normalized] || "text-muted-foreground";
}
