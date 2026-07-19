import { WidgetShell } from "../WidgetShell";
import type { SaarthiEarnings } from "@/types/saarthi";

interface Props {
  earnings?: SaarthiEarnings | null;
  size?: "small" | "medium" | "large";
}

export function EarningsWidget({
  earnings,
}: Props) {
  if (!earnings) {
    return null;
  }

  const isP1 =
    String(earnings.currentPriorityLabel || "")
      .trim()
      .toUpperCase() === "P1";

  return (
    <WidgetShell
      title="Earnings"
      subtitle="Today and your recent benchmark"
    >
      <div className="grid grid-cols-3 gap-2">
        <ValueBlock
          label="Today"
          value={formatCurrency(earnings.today)}
          emphasize
        />
        <ValueBlock
          label="Yesterday"
          value={formatCurrency(earnings.yesterday)}
        />
        <ValueBlock
          label="7-day avg"
          value={formatCurrency(earnings.average7d)}
        />
      </div>

      <div className="mt-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5">
        {isP1 ? (
          <P1Benchmark earnings={earnings} />
        ) : (
          <UnlockBenchmark earnings={earnings} />
        )}
      </div>
    </WidgetShell>
  );
}

function ValueBlock({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium text-muted-foreground">
        {label}
      </p>
      <p
        className={[
          "mt-0.5 truncate font-semibold text-foreground",
          emphasize ? "text-lg" : "text-sm",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function P1Benchmark({
  earnings,
}: {
  earnings: SaarthiEarnings;
}) {
  const benchmark = earnings.currentBenchmark;
  const average = earnings.average7d;
  const gap =
    benchmark !== null &&
    benchmark !== undefined &&
    average !== null &&
    average !== undefined
      ? Number(benchmark) - Number(average)
      : null;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground">
          P1 benchmark
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {formatCurrency(benchmark)}
        </p>
      </div>

      {gap !== null ? (
        <p
          className={[
            "shrink-0 text-right text-xs font-semibold",
            gap > 0
              ? "text-orange-600"
              : "text-emerald-600",
          ].join(" ")}
        >
          {gap > 0
            ? `${formatCurrency(gap)} below benchmark`
            : "At or above benchmark"}
        </p>
      ) : null}
    </div>
  );
}

function UnlockBenchmark({
  earnings,
}: {
  earnings: SaarthiEarnings;
}) {
  const nextPriority =
    earnings.nextPriorityLabel || "next priority";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground">
          {nextPriority} benchmark
        </p>
        <p className="mt-0.5 text-sm font-semibold text-foreground">
          {formatCurrency(earnings.nextBenchmark)}
        </p>
      </div>

      {earnings.unlockDelta !== null &&
      earnings.unlockDelta !== undefined ? (
        <p className="shrink-0 text-right text-xs font-semibold text-primary">
          {Number(earnings.unlockDelta) > 0
            ? `${formatCurrency(earnings.unlockDelta)} to unlock`
            : "Benchmark reached"}
        </p>
      ) : null}
    </div>
  );
}

function formatCurrency(value: unknown): string {
  const numericValue = Number(value);

  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(numericValue)
  ) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}
