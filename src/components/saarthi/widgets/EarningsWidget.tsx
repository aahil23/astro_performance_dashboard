import { WidgetShell } from "../WidgetShell";
import type { SaarthiEarnings } from "@/types/saarthi";

interface Props {
  earnings?: SaarthiEarnings | null;
  size?: "small" | "medium" | "large";
}

export function EarningsWidget({ earnings }: Props) {
  if (!earnings) return null;

  const benchmark = toFiniteNumber(
    earnings.effectiveBenchmark ?? earnings.currentBenchmark,
  );
  const today = toFiniteNumber(earnings.today);
  const status = formatStatus(earnings.benchmarkStatus);
  const gap =
    benchmark !== null && today !== null
      ? benchmark - today
      : null;

  return (
    <WidgetShell title="Earnings" subtitle="Today and your performance benchmark">
      <div className="rounded-xl border border-border/60 bg-muted/25 p-3">
        <p className="text-xs font-medium text-muted-foreground">
          Today&apos;s earnings
        </p>
        <p className="mt-0.5 text-3xl font-bold leading-none text-foreground">
          {formatCurrency(today)}
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ValueBlock label="Yesterday" value={formatCurrency(earnings.yesterday)} />
          <ValueBlock label="7-day avg" value={formatCurrency(earnings.average7d)} />
        </div>
      </div>

      <div className="mt-2.5 rounded-xl border border-border/60 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Performance benchmark
            </p>
            <p className="mt-0.5 text-lg font-bold leading-tight text-foreground">
              {formatCurrency(benchmark)}
            </p>
          </div>

          <div className="text-right">
            <p className={`text-xs font-semibold ${getStatusClass(earnings.benchmarkStatus)}`}>
              {status}
            </p>
            {gap !== null && gap > 0 ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {formatCurrency(gap)} below
              </p>
            ) : null}
          </div>
        </div>

        {hasValue(earnings.nextBenchmark) ? (
          <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
            <span className="text-muted-foreground">
              {earnings.nextPriorityLabel || "Next priority"} benchmark
            </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(earnings.nextBenchmark)}
            </span>
          </div>
        ) : null}
      </div>
    </WidgetShell>
  );
}

function ValueBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background px-3 py-2">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function hasValue(value: unknown): boolean {
  return toFiniteNumber(value) !== null;
}

function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatCurrency(value: unknown): string {
  const numericValue = toFiniteNumber(value);
  if (numericValue === null) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatStatus(status: unknown): string {
  const normalized = String(status || "").trim().toLowerCase();

  const labels: Record<string, string> = {
    above_target: "Above target",
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
    stable: "text-amber-600",
    needs_attention: "text-orange-600",
    insufficient_data: "text-muted-foreground",
  };

  return classes[normalized] || "text-muted-foreground";
}
