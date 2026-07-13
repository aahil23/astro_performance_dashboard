import { WidgetShell } from "../WidgetShell";
import { formatInr } from "@/services/saarthiApi";
import type { SaarthiEarnings } from "@/types/saarthi";

interface Props {
  earnings?: SaarthiEarnings | null;
}

export function EarningsWidget({ earnings }: Props) {
  if (!earnings) return null;

  return (
    <WidgetShell title="Earnings" subtitle="Today vs your recent average">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Today" value={formatInr(earnings.today)} highlight />
        <Stat label="Yesterday" value={formatInr(earnings.yesterday)} />
        <Stat label="7-day avg" value={formatInr(earnings.average7d)} />
      </div>

      {(earnings.currentBenchmark !== undefined ||
        earnings.nextBenchmark !== undefined) && (
        <div className="mt-4 rounded-xl bg-brand-soft p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            Next Benchmark
          </p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-lg font-bold text-foreground">
              {formatInr(earnings.nextBenchmark)}
            </span>
            {earnings.unlockDelta !== undefined &&
              earnings.unlockDelta !== null && (
                <span className="text-xs font-medium text-primary">
                  +{formatInr(earnings.unlockDelta)} to unlock
                </span>
              )}
          </div>
          {earnings.nextPriorityLabel && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Unlocks: {earnings.nextPriorityLabel}
            </p>
          )}
        </div>
      )}

      {earnings.potentialLoss !== undefined &&
        earnings.potentialLoss !== null &&
        earnings.potentialLoss > 0 && (
          <p className="mt-2 text-xs text-destructive">
            At risk: {formatInr(earnings.potentialLoss)}
          </p>
        )}
    </WidgetShell>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 ${
        highlight ? "bg-primary/10" : "bg-muted/40"
      }`}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-base font-bold tracking-tight ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}