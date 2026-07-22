import { Check } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type { SaarthiJourney } from "@/types/saarthi";

interface Props {
  journey?: SaarthiJourney | null;
  currentPriority?: string | null;
}

function normalizePriority(value: unknown): string | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  return /^P[1-5]$/.test(normalized) ? normalized : null;
}

export function PriorityJourneyWidget({
  journey,
  currentPriority,
}: Props) {
  const validCurrentPriority = normalizePriority(currentPriority);

  // PRE_MATURE and any non-P1–P5 state should not show a priority journey.
  if (!validCurrentPriority) return null;

  const steps = (journey?.steps ?? []).filter((step) =>
    Boolean(normalizePriority(step.key ?? step.label)),
  );

  if (!steps.length) return null;

  const currentIndex = steps.findIndex((step) => {
    const stepPriority = normalizePriority(step.key ?? step.label);
    return step.isCurrent || stepPriority === validCurrentPriority;
  });

  const progress = clampPercent(journey?.progressPercent);

  return (
    <WidgetShell title="Priority Journey">
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute left-[10%] right-[10%] top-3 h-0.5 rounded bg-muted"
        />

        {currentIndex > 0 ? (
          <div
            aria-hidden="true"
            className="absolute left-[10%] top-3 h-0.5 rounded bg-status-strong"
            style={{
              width: `${(currentIndex / Math.max(steps.length - 1, 1)) * 80}%`,
            }}
          />
        ) : null}

        <ol
          className="relative grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`,
          }}
        >
          {steps.map((step, index) => {
            const stepPriority =
              normalizePriority(step.key ?? step.label) ??
              String(step.label ?? step.key);
            const isCurrent =
              index === currentIndex || stepPriority === validCurrentPriority;
            const isDone = currentIndex >= 0 && index < currentIndex;

            return (
              <li
                key={step.key}
                className="flex min-w-0 flex-col items-center text-center"
              >
                <div
                  className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : isDone
                        ? "bg-status-strong text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="h-3 w-3" /> : index + 1}
                </div>

                <p
                  className={`mt-2 w-full truncate text-[10px] ${
                    isCurrent
                      ? "font-semibold text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {stepPriority}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {progress !== null ? (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>

          {journey?.currentTtpu || journey?.targetTtpu ? (
            <p className="mt-2 text-[11px] text-muted-foreground">
              TTPU {journey?.currentTtpu ?? "—"} /{" "}
              {journey?.targetTtpu ?? "—"}
              {journey?.gap ? ` · gap ${journey.gap}` : ""}
            </p>
          ) : null}
        </div>
      ) : null}

      {journey?.message ? (
        <p className="mt-2 text-xs text-foreground/80">{journey.message}</p>
      ) : null}
    </WidgetShell>
  );
}

function clampPercent(v: number | null | undefined) {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}
