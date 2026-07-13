import { Check } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiJourney } from "@/types/saarthi";

interface Props {
  journey?: SaarthiJourney | null;
}

export function PriorityJourneyWidget({ journey }: Props) {
  const steps = journey?.steps ?? [];
  if (!steps.length) return null;

  const progress = clampPercent(journey?.progressPercent);

  return (
    <WidgetShell title="Priority Journey">
      <ol className="flex items-center gap-1">
        {steps.map((step, i) => {
          const done = i < steps.findIndex((s) => s.isCurrent);
          const current = step.isCurrent;
          return (
            <li key={step.key} className="flex flex-1 items-center gap-1">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  current
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : done
                      ? "bg-status-strong text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded ${
                    done ? "bg-status-strong" : "bg-muted"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 grid grid-cols-3 gap-1">
        {steps.map((step) => (
          <p
            key={`${step.key}-label`}
            className={`truncate text-[10px] ${
              step.isCurrent
                ? "font-semibold text-primary"
                : "text-muted-foreground"
            }`}
          >
            {step.label ?? step.key}
          </p>
        ))}
      </div>

      {progress !== null && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          {(journey?.currentTtpu || journey?.targetTtpu) && (
            <p className="mt-2 text-[11px] text-muted-foreground">
              TTPU {journey?.currentTtpu ?? "—"} / {journey?.targetTtpu ?? "—"}
              {journey?.gap ? ` · gap ${journey.gap}` : ""}
            </p>
          )}
        </div>
      )}

      {journey?.message && (
        <p className="mt-2 text-xs text-foreground/80">{journey.message}</p>
      )}
    </WidgetShell>
  );
}

function clampPercent(v: number | null | undefined) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}