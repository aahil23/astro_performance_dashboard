import { useEffect, useRef, useState } from "react";
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

  const labelsRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = labelsRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    setContainerWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  // Decide which labels to show without overlapping.
  // Always keep first and last; greedily drop interior labels that are too close.
  const labelStrs = thresholds.map((t) => String(t));
  const approxCharPx = containerWidth < 280 ? 5.5 : 6;
  const gapPx = 6;
  const widths = labelStrs.map((s) => s.length * approxCharPx + gapPx);
  const positionsPx = thresholds.map((t) => (pct(t) / 100) * containerWidth);

  const visible = new Array(thresholds.length).fill(true);
  if (containerWidth > 0) {
    let lastIdx = 0;
    for (let i = 1; i < thresholds.length - 1; i++) {
      const minSpace = (widths[lastIdx] + widths[i]) / 2;
      const nextMinSpace = (widths[i] + widths[thresholds.length - 1]) / 2;
      const okLeft = positionsPx[i] - positionsPx[lastIdx] >= minSpace;
      const okRight =
        positionsPx[thresholds.length - 1] - positionsPx[i] >= nextMinSpace;
      if (okLeft && okRight) {
        visible[i] = true;
        lastIdx = i;
      } else {
        visible[i] = false;
      }
    }
    // Ensure last doesn't overlap last visible interior
    const lastI = thresholds.length - 1;
    const minLast = (widths[lastIdx] + widths[lastI]) / 2;
    if (positionsPx[lastI] - positionsPx[lastIdx] < minLast && lastIdx !== 0) {
      visible[lastIdx] = false;
    }
  }

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

      <div
        ref={labelsRef}
        className="relative h-4 w-full text-[10px] text-muted-foreground"
      >
        {thresholds.map((t, i) => {
          if (!visible[i]) return null;
          const isFirst = i === 0;
          const isLast = i === thresholds.length - 1;
          const transform = isFirst
            ? "translateX(0)"
            : isLast
              ? "translateX(-100%)"
              : "translateX(-50%)";
          return (
            <span
              key={i}
              className="absolute tabular-nums whitespace-nowrap"
              style={{ left: `${pct(t)}%`, transform }}
            >
              {t}
            </span>
          );
        })}
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