interface Props {
  score: number;
  benchmark: number;
  max?: number;
}

// Visual zones: poor 0-50%, average 50-80%, good 80-95%, excellent 95-100% of benchmark scale
export function SegmentedBenchmarkBar({ score, benchmark, max }: Props) {
  const scale = max ?? Math.max(benchmark * 1.25, score * 1.1, 1);
  const pct = (v: number) => `${Math.min(100, Math.max(0, (v / scale) * 100))}%`;
  return (
    <div className="space-y-2">
      <div className="relative h-3 w-full overflow-hidden rounded-full">
        <div className="absolute inset-y-0 left-0 w-[40%] bg-status-poor" />
        <div className="absolute inset-y-0 left-[40%] w-[30%] bg-status-average" />
        <div className="absolute inset-y-0 left-[70%] w-[20%] bg-status-good" />
        <div className="absolute inset-y-0 left-[90%] w-[10%] bg-status-excellent" />
        <div
          className="absolute -top-1 h-5 w-0.5 bg-foreground"
          style={{ left: pct(benchmark) }}
          aria-label="Benchmark"
        />
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: pct(score) }}
        />
      </div>
    </div>
  );
}