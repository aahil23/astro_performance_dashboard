import type { ApiStatus, BenchmarkBands } from "@/services/dashboardApi";
import { getStatusColor } from "@/services/dashboardApi";

interface Props {
  bands: BenchmarkBands;
  score: number;
  status: ApiStatus | null;
}

const getSafeStatusColor = (status: ApiStatus | null) => {
  if (!status) return "var(--muted-foreground)";

  const normalized = String(status).trim().toLowerCase();

  if (normalized === "weak") return "var(--status-critical)";
  if (normalized === "stable") return "var(--status-stable)";
  if (normalized === "strong") return "var(--status-strong)";
  if (normalized === "elite") return "var(--status-elite)";

  return getStatusColor(status);
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const formatLabel = (value: number) => {
  if (Number.isInteger(value)) return String(value);
  return Number(value).toFixed(1);
};

const getScorePosition = (
  score: number,
  bands: BenchmarkBands,
  hasEliteBand: boolean
) => {
  const { p0, p75, p90, p95, p100 } = bands;

  if (!hasEliteBand) {
    if (score <= p75) {
      const progress = clamp((score - p0) / Math.max(1e-9, p75 - p0), 0, 1);
      return progress * 40;
    }

    if (score <= p90) {
      const progress = clamp((score - p75) / Math.max(1e-9, p90 - p75), 0, 1);
      return 40 + progress * 30;
    }

    const progress = clamp((score - p90) / Math.max(1e-9, p95 - p90), 0, 1);
    return 70 + progress * 30;
  }

  if (score <= p75) {
    const progress = clamp((score - p0) / Math.max(1e-9, p75 - p0), 0, 1);
    return progress * 40;
  }

  if (score <= p90) {
    const progress = clamp((score - p75) / Math.max(1e-9, p90 - p75), 0, 1);
    return 40 + progress * 30;
  }

  if (score <= p95) {
    const progress = clamp((score - p90) / Math.max(1e-9, p95 - p90), 0, 1);
    return 70 + progress * 20;
  }

  const progress = clamp((score - p95) / Math.max(1e-9, p100 - p95), 0, 1);
  return 90 + progress * 10;
};

export function SegmentedBenchmarkBar({ bands, score, status }: Props) {
  const hasEliteBand = Number(bands.p95) < Number(bands.p100);

  const visualBands = hasEliteBand
    ? [
        {
          key: "weak",
          left: 0,
          width: 40,
          color: "var(--status-critical)",
        },
        {
          key: "stable",
          left: 40,
          width: 30,
          color: "var(--status-stable)",
        },
        {
          key: "strong",
          left: 70,
          width: 20,
          color: "var(--status-strong)",
        },
        {
          key: "elite",
          left: 90,
          width: 10,
          color: "var(--status-elite)",
        },
      ]
    : [
        {
          key: "weak",
          left: 0,
          width: 40,
          color: "var(--status-critical)",
        },
        {
          key: "stable",
          left: 40,
          width: 30,
          color: "var(--status-stable)",
        },
        {
          key: "strong",
          left: 70,
          width: 30,
          color: "var(--status-strong)",
        },
      ];

  const thresholds = hasEliteBand
    ? [
        { value: bands.p0, position: 0 },
        { value: bands.p75, position: 40 },
        { value: bands.p90, position: 70 },
        { value: bands.p95, position: 90 },
        { value: bands.p100, position: 100 },
      ]
    : [
        { value: bands.p0, position: 0 },
        { value: bands.p75, position: 40 },
        { value: bands.p90, position: 70 },
        { value: bands.p95, position: 100 },
      ];

  const fillPct = getScorePosition(score, bands, hasEliteBand);
  const fillColor = getSafeStatusColor(status);

  return (
    <div className="space-y-2">
      <div className="relative h-2.5 w-full overflow-hidden rounded-full">
        {visualBands.map((segment) => (
          <div
            key={segment.key}
            className="absolute inset-y-0"
            style={{
              left: `${segment.left}%`,
              width: `${segment.width}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>

      <div className="relative h-5 w-full text-[10px] text-muted-foreground">
        {thresholds.map((t, i) => {
          const isFirst = i === 0;
          const isLast = i === thresholds.length - 1;

          const transform = isFirst
            ? "translateX(0)"
            : isLast
              ? "translateX(-100%)"
              : "translateX(-50%)";

          return (
            <span
              key={`${t.value}-${i}`}
              className="absolute tabular-nums whitespace-nowrap"
              style={{
                left: `${t.position}%`,
                transform,
              }}
            >
              {formatLabel(Number(t.value))}
            </span>
          );
        })}
      </div>

      <div className="pt-1">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${fillPct}%`,
              backgroundColor: fillColor,
            }}
            aria-label="Your score"
          />
        </div>
      </div>
    </div>
  );
}
