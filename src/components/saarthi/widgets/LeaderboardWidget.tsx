import { ArrowDown, ArrowUp } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiRanking } from "@/types/saarthi";

interface Props {
  ranking?: SaarthiRanking | null;
  size?: "small" | "medium" | "large";
}

export function LeaderboardWidget({
  ranking,
}: Props) {
  if (!ranking) {
    return null;
  }

  const hasRank = isFiniteNumber(
    ranking.currentRank,
  );

  if (!hasRank) {
    return null;
  }

  return (
    <WidgetShell
      title="Cohort Ranking"
      subtitle="Your position among similar experts"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium text-muted-foreground">
            Current rank
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            #{Math.round(Number(ranking.currentRank))}
          </p>
          {isFiniteNumber(ranking.cohortSize) ? (
            <p className="mt-1 text-xs text-muted-foreground">
              out of {Math.round(Number(ranking.cohortSize))}
            </p>
          ) : null}
        </div>

        <Movement movement={ranking.movement} />
      </div>
    </WidgetShell>
  );
}

function Movement({
  movement,
}: {
  movement?: number | null;
}) {
  if (!isFiniteNumber(movement)) {
    return null;
  }

  const value = Number(movement);

  if (value === 0) {
    return (
      <p className="pb-1 text-xs font-semibold text-muted-foreground">
        No change
      </p>
    );
  }

  const improved = value > 0;
  const Icon = improved ? ArrowUp : ArrowDown;

  return (
    <div
      className={[
        "mb-1 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        improved
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-orange-500/10 text-orange-600",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5" />
      {Math.abs(Math.round(value))}
    </div>
  );
}

function isFiniteNumber(value: unknown): boolean {
  return (
    value !== null &&
    value !== undefined &&
    Number.isFinite(Number(value))
  );
}
