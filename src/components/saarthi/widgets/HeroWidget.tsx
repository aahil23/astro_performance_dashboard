import type { SaarthiHero, SaarthiIdentity } from "@/types/saarthi";

interface Props {
  identity: SaarthiIdentity;
  hero?: SaarthiHero | null;
}

const MIN_MONTHLY_INCREMENT_SECONDS = 60;
const MAX_MONTHLY_INCREMENT_SECONDS = 120;

function asFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function parseDurationToSeconds(value: unknown): number | null {
  const numeric = asFiniteNumber(value);
  if (numeric !== null) {
    return numeric;
  }

  if (typeof value !== "string") {
    return null;
  }

  const hours = Number(value.match(/(\d+(?:\.\d+)?)\s*h/i)?.[1] ?? 0);
  const minutes = Number(value.match(/(\d+(?:\.\d+)?)\s*m/i)?.[1] ?? 0);
  const seconds = Number(value.match(/(\d+(?:\.\d+)?)\s*s/i)?.[1] ?? 0);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return totalSeconds > 0 ? totalSeconds : null;
}

function formatSeconds(value: number | null): string {
  if (value === null) {
    return "—";
  }

  const rounded = Math.max(0, Math.round(value));
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function clampPercent(value: number | null): number | null {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
}

/** Stable deterministic hash: the same input always returns the same output. */
function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/** Returns YYYY-MM in the user's local timezone. */
function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * Stable monthly stretch increment between 60 and 120 seconds.
 * Seeded by expert ID + calendar month + metric name.
 */
function getMonthlyStretchIncrementSeconds(
  expertId: string | number,
): number {
  const seed = [
    String(expertId),
    getCurrentMonthKey(),
    "average_talk_time",
  ].join("|");

  const range =
    MAX_MONTHLY_INCREMENT_SECONDS - MIN_MONTHLY_INCREMENT_SECONDS + 1;

  return MIN_MONTHLY_INCREMENT_SECONDS + (hashString(seed) % range);
}

function getDisplayedTarget({
  expertId,
  currentSeconds,
  officialTargetSeconds,
}: {
  expertId: string | number;
  currentSeconds: number | null;
  officialTargetSeconds: number | null;
}): {
  targetSeconds: number | null;
  isStretchTarget: boolean;
} {
  // If the expert has not yet reached the official threshold, show that threshold.
  if (
    currentSeconds === null ||
    officialTargetSeconds === null ||
    currentSeconds < officialTargetSeconds
  ) {
    return {
      targetSeconds: officialTargetSeconds,
      isStretchTarget: false,
    };
  }

  // Once the official threshold is reached, show a stable monthly stretch target.
  return {
    targetSeconds:
      currentSeconds + getMonthlyStretchIncrementSeconds(expertId),
    isStretchTarget: true,
  };
}

export function HeroWidget({ identity, hero }: Props) {
  const greeting = hero?.greeting ?? `Namaste, ${identity.expertName}`;
  const priority =
    hero?.priorityLabel ?? identity.currentPriority ?? null;

  const currentSeconds = parseDurationToSeconds(hero?.currentAtt);
  const officialTargetSeconds = parseDurationToSeconds(hero?.targetAtt);

  const {
    targetSeconds: displayedTargetSeconds,
    isStretchTarget,
  } = getDisplayedTarget({
    expertId: identity.expertId,
    currentSeconds,
    officialTargetSeconds,
  });

  const backendProgress = asFiniteNumber(hero?.progressPercent);

  const displayedProgress =
    isStretchTarget &&
    currentSeconds !== null &&
    displayedTargetSeconds !== null &&
    displayedTargetSeconds > 0
      ? clampPercent((currentSeconds / displayedTargetSeconds) * 100)
      : clampPercent(backendProgress);

  const targetLabel = isStretchTarget
    ? "Next target"
    : identity.currentPriority === "P1"
      ? "Safe target"
      : "Next priority target";

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-brand-soft p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {priority ?? "Your Priority"}
        </span>

        {displayedProgress !== null ? (
          <span className="text-xs font-medium text-muted-foreground">
            Progress {Math.round(displayedProgress)}%
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <h2 className="text-xl font-bold leading-tight text-foreground">
          {greeting}
        </h2>

        {hero?.message ? (
          <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
            {hero.message}
          </p>
        ) : null}
      </div>

      {displayedProgress !== null ? (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${displayedProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      {currentSeconds !== null || displayedTargetSeconds !== null ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricBox
            label="Current"
            value={formatSeconds(currentSeconds)}
          />
          <MetricBox
            label={targetLabel}
            value={formatSeconds(displayedTargetSeconds)}
          />
        </div>
      ) : null}

      {hero?.motivation ? (
        <p className="mt-3 rounded-xl bg-background/55 px-3 py-2 text-xs leading-4 text-foreground/80">
          {hero.motivation}
        </p>
      ) : null}
    </section>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-primary/10 bg-background/70 px-3 py-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-base font-bold leading-tight text-foreground">
        {value}
      </p>
    </div>
  );
}
