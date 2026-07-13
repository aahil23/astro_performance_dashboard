import { ArrowDown, ArrowUp, Minus, Trophy } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiRanking } from "@/types/saarthi";

interface Props {
  ranking?: SaarthiRanking | null;
}

export function LeaderboardWidget({ ranking }: Props) {
  if (!ranking || ranking.currentRank === null || ranking.currentRank === undefined) {
    return null;
  }

  const movement = ranking.movement ?? 0;
  const dir = movement > 0 ? "up" : movement < 0 ? "down" : "flat";

  return (
    <WidgetShell
      title="Cohort Ranking"
      subtitle={
        ranking.cohortSize
          ? `Among ${ranking.cohortSize} experts`
          : undefined
      }
    >
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-foreground">
            #{ranking.currentRank}
            {ranking.cohortSize && (
              <span className="text-sm font-normal text-muted-foreground">
                {" "}/ {ranking.cohortSize}
              </span>
            )}
          </p>
          {ranking.yesterdayRank !== undefined && ranking.yesterdayRank !== null && (
            <p className="text-[11px] text-muted-foreground">
              Yesterday #{ranking.yesterdayRank}
            </p>
          )}
        </div>
        <MovementBadge dir={dir} value={Math.abs(movement)} />
      </div>
    </WidgetShell>
  );
}

function MovementBadge({
  dir,
  value,
}: {
  dir: "up" | "down" | "flat";
  value: number;
}) {
  const cls =
    dir === "up"
      ? "bg-status-strong/10 text-status-strong"
      : dir === "down"
        ? "bg-status-critical/10 text-status-critical"
        : "bg-muted text-muted-foreground";
  const Icon = dir === "up" ? ArrowUp : dir === "down" ? ArrowDown : Minus;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${cls}`}
    >
      <Icon className="h-3 w-3" />
      {value > 0 ? value : "—"}
    </span>
  );
}