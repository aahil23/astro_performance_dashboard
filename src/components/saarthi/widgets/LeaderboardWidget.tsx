import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiRanking } from "@/types/saarthi";

interface Props {
  ranking?: SaarthiRanking | null;
  currentPriority?: string | null;
  size?: "small" | "medium" | "large";
}

export function LeaderboardWidget({
  ranking,
  currentPriority,
}: Props) {
  const priority = normalizePriority(currentPriority);

  if (
    !ranking ||
    !isFiniteNumber(ranking.currentRank) ||
    !priority
  ) {
    return null;
  }

  return (
    <WidgetShell
      title={`${priority} Leaderboard`}
      subtitle={`Your ranking among ${priority} experts`}
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold leading-none text-foreground">
            #{Math.round(Number(ranking.currentRank))}
          </span>

          {isFiniteNumber(ranking.cohortSize) ? (
            <span className="text-xs text-muted-foreground">
              out of {Math.round(Number(ranking.cohortSize))}
            </span>
          ) : null}
        </div>

        <Movement movement={ranking.movement} />
      </div>
    </WidgetShell>
  );
}

function Movement({ movement }: { movement?: number | null }) {
  if (!isFiniteNumber(movement)) return null;

  const value = Number(movement);

  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
        <Minus className="h-3.5 w-3.5" />
        No change
      </span>
    );
  }

  const improved = value > 0;
  const Icon = improved ? ArrowUp : ArrowDown;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        improved
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-orange-500/10 text-orange-600"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(Math.round(value))}
    </span>
  );
}

function normalizePriority(
  currentPriority?: string | null,
): string | null {
  const priority = String(currentPriority ?? "")
    .trim()
    .toUpperCase();

  return /^P[1-5]$/.test(priority) ? priority : null;
}

function isFiniteNumber(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  );
}
