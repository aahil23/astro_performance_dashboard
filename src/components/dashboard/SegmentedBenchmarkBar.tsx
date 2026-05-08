import type { MetricStatus } from "@/lib/dashboard-data";
import { getStatusColor } from "@/lib/dashboard-data";

interface Props {
  /** Ordered threshold boundaries, e.g. [0, 75, 90, 95, 100]. Backend-driven. */
  thresholds?: number[];
  /** User's percentile (0-100), used to fill the score bar. */
  percentile: number | null;
  /** Current performance tier — drives the score bar color. */
  status: MetricStatus;
}

const TIER_COLORS = [
  "var(--status-critical)",
  "var(--status-stable)",
  "var(--status-strong)",
  "var(--status-elite)",
];

export function SegmentedBenchmarkBar({
  thresholds = [0, 75, 90, 95, 100],
  percentile,
  status,
}: Props) {
  const min = thresholds[0];
  const max = thresholds[thresholds.length - 1];
  const range = Math.max(1, max - min);
  const pct = (v: number) => ((v - min) / range) * 100;

  const segments = thresholds.slice(0, -1).map((start, i) => {
    const end = thresholds[i + 1];
    return {
      left: pct(start),
      width: pct(end) - pct(start),
      color: TIER_COLORS[i] ?? TIER_COLORS[TIER_COLORS.length - 1],
    };
  });

  const fillPct =
    percentile === null
      ? 0
      : Math.min(100, Math.max(0, pct(percentile)));

  return (
    <div className="space-y-2">
      {/* Segmented benchmark scale */}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div
            key={i}
            className="absolute inset-y-0"
            style={{ left: `${s.left}%`, width: `${s.width}%`, backgroundColor: s.color }}
          />
        ))}
      </div>

      {/* Threshold labels */}
      <div className="relative h-4 w-full text-[10px] text-muted-foreground">
        {thresholds.map((t, i) => (
          <span
            key={i}
            className="absolute -translate-x-1/2 tabular-nums"
            style={{ left: `${pct(t)}%` }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Your Score bar */}
      <div className="pt-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          {percentile !== null && (
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${fillPct}%`, backgroundColor: getStatusColor(status) }}
              aria-label="Your score"
            />
          )}
        </div>
      </div>
    </div>
  );
}