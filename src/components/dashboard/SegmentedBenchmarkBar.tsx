interface Props {
  /** Percentile from 0 to 100. */
  percentile: number | null;
}

// Tier zones based on percentile thresholds:
// Critical <75 | Stable 75-90 | Strong 90-95 | Elite >95
export function SegmentedBenchmarkBar({ percentile }: Props) {
  const clamped =
    percentile === null ? null : Math.min(100, Math.max(0, percentile));
  return (
    <div className="space-y-1.5">
      <div className="relative h-3 w-full overflow-hidden rounded-full">
        <div className="absolute inset-y-0 left-0 w-[75%] bg-status-critical" />
        <div className="absolute inset-y-0 left-[75%] w-[15%] bg-status-stable" />
        <div className="absolute inset-y-0 left-[90%] w-[5%] bg-status-strong" />
        <div className="absolute inset-y-0 left-[95%] w-[5%] bg-status-elite" />
        {clamped !== null && (
          <div
            className="absolute -top-1 h-5 w-0.5 bg-foreground"
            style={{ left: `${clamped}%` }}
            aria-label="Your percentile"
          />
        )}
      </div>
    </div>
  );
}