import type { ApiStatus, BenchmarkBands } from "@/services/dashboardApi";
import { getStatusColor } from "@/services/dashboardApi";

interface Props {
  bands: BenchmarkBands;
  score: number;
  status: ApiStatus | null;
}

const TIER_COLORS = [
  "var(--status-critical)",
  "var(--status-stable)",
  "var(--status-strong)",
  "var(--status-elite)",
];

export function SegmentedBenchmarkBar({ bands, score, status }: Props) {
  const thresholds = [bands.p0, bands.p75, bands.p90, bands.p95, bands.p100];
  const min = thresholds[0];
  const max = thresholds[thresholds.length - 1];
  const range = Math.max(1e-9, max - min);
  const pct = (v: number) => ((v - min) / range) * 100;

  const segments = thresholds.slice(0, -1).map((start, i) => {
    const end = thresholds[i + 1];
    return {
      left: pct(start),
      width: Math.max(0, pct(end) - pct(start)),
      color: TIER_COLORS[i] ?? TIER_COLORS[TIER_COLORS.length - 1],
    };
  });

  const fillPct = Math.min(100, Math.max(0, pct(score)));

  return (
    <div className="space-y-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full">
        {segments.map((s, i) => (
          <div
            key={i}
            className="absolute inset-y-0"
            style={{ left: `${s.left}%`, width: `${s.width}%`, backgroundColor: s.color }}
          />
        ))}
      </div>

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

      <div className="pt-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${fillPct}%`, backgroundColor: getStatusColor(status) }}
            aria-label="Your score"
          />
        </div>
      </div>
    </div>
  );
}