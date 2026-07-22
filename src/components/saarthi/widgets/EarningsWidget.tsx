import { WidgetShell } from "../WidgetShell";
import type { SaarthiEarnings } from "@/types/saarthi";

interface Props {
  earnings?: SaarthiEarnings | null;
  size?: "small" | "medium" | "large";
}

export function EarningsWidget({ earnings }: Props) {
  if (!earnings) return null;

  const isP1 =
    String(earnings.currentPriorityLabel || "").trim().toUpperCase() === "P1";

  return (
    <WidgetShell title="Earnings" subtitle="Today and your recent benchmark">
      <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Today's earnings
        </p>
        <p className="mt-0.5 text-3xl font-bold leading-none text-foreground">
          {formatCurrency(earnings.today)}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ValueBlock
            label="Yesterday"
            value={formatCurrency(earnings.yesterday)}
          />
          <ValueBlock
            label="7-day avg"
            value={formatCurrency(earnings.average7d)}
          />
        </div>
      </div>

      <div className="mt-2.5">
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
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-background px-3 py-2">
      <p className="text-[11px] font-medium text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function P1Benchmark({ earnings }: { earnings: SaarthiEarnings }) {
  const benchmark = toFiniteNumber(earnings.currentBenchmark);
  const today = toFiniteNumber(earnings.today);

  const gap =
    benchmark !== null && today !== null
      ? benchmark - today
      : null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          P1 benchmark
        </p>
        <p className="mt-0.5 text-lg font-bold leading-tight text-foreground">
          {formatCurrency(benchmark)}
        </p>
      </div>

      {gap !== null ? (
        <p
          className={`text-right text-xs font-semibold ${
            gap > 0 ? "text-orange-600" : "text-emerald-600"
          }`}
        >
          {gap > 0
            ? `${formatCurrency(gap)} below benchmark`
            : "At or above benchmark"}
        </p>
      ) : null}
    </div>
  );
}

function UnlockBenchmark({ earnings }: { earnings: SaarthiEarnings }) {
  const nextPriority = earnings.nextPriorityLabel || "Next priority";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          {nextPriority} benchmark
        </p>
        <p className="mt-0.5 text-lg font-bold leading-tight text-foreground">
          {formatCurrency(earnings.nextBenchmark)}
        </p>
      </div>

      {earnings.unlockDelta !== null && earnings.unlockDelta !== undefined ? (
        <p className="text-right text-xs font-semibold text-primary">
          {Number(earnings.unlockDelta) > 0
            ? `${formatCurrency(earnings.unlockDelta)} to unlock`
            : "Benchmark reached"}
        </p>
      ) : null}
    </div>
  );
}

function toFiniteNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return null;
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
}

function formatCurrency(value: unknown): string {
  const numericValue = toFiniteNumber(value);

  if (numericValue === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}
