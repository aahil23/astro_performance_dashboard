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

  const hours = Number(
    value.match(/(\d+(?:\.\d+)?)\s*h/i)?.[1] ?? 0,
  );

  const minutes = Number(
    value.match(/(\d+(?:\.\d+)?)\s*m/i)?.[1] ?? 0,
  );

  const seconds = Number(
    value.match(/(\d+(?:\.\d+)?)\s*s/i)?.[1] ?? 0,
  );

  const totalSeconds =
    hours * 3600 +
    minutes * 60 +
    seconds;

  return totalSeconds > 0
    ? totalSeconds
    : null;
}

function formatSeconds(value: number | null): string {
  if (value === null) {
    return "—";
  }

  const rounded = Math.max(
    0,
    Math.round(value),
  );

  const minutes = Math.floor(
    rounded / 60,
  );

  const seconds =
    rounded % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  if (seconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${seconds}s`;
}

function clampPercent(value: number | null): number | null {
  if (
    value === null ||
    Number.isNaN(value)
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.min(100, value),
  );
}

/**
 * Stable deterministic hash.
 *
 * The same input always gives the same output.
 */
function hashString(value: string): number {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(
      hash,
      16777619,
    );
  }

  return hash >>> 0;
}

/**
 * Returns YYYY-MM in the user's local timezone.
 *
 * This ensures the increment changes once per calendar month.
 */
function getCurrentMonthKey(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * Stable monthly increment between 60 and 120 seconds.
 *
 * Seed:
 * - expert ID
 * - calendar month
 * - metric name
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
    MAX_MONTHLY_INCREMENT_SECONDS -
    MIN_MONTHLY_INCREMENT_SECONDS +
    1;

  return (
    MIN_MONTHLY_INCREMENT_SECONDS +
    (hashString(seed) % range)
  );
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
  incrementSeconds: number | null;
} {
  if (
    currentSeconds === null ||
    officialTargetSeconds === null ||
    currentSeconds < officialTargetSeconds
  ) {
    return {
      targetSeconds: officialTargetSeconds,
      isStretchTarget: false,
      incrementSeconds: null,
    };
  }

  const incrementSeconds =
    getMonthlyStretchIncrementSeconds(
      expertId,
    );

  return {
    targetSeconds:
      currentSeconds +
      incrementSeconds,
    isStretchTarget: true,
    incrementSeconds,
  };
}

export function HeroWidget({
  identity,
  hero,
}: Props) {
  const greeting =
    hero?.greeting ??
    `Namaste, ${identity.expertName}`;

  const priority =
    hero?.priorityLabel ??
    identity.currentPriority ??
    null;

  const currentSeconds =
    parseDurationToSeconds(
      hero?.currentAtt,
    );

  const officialTargetSeconds =
    parseDurationToSeconds(
      hero?.targetAtt,
    );

  const {
    targetSeconds: displayedTargetSeconds,
    isStretchTarget,
  } = getDisplayedTarget({
    expertId: identity.expertId,
    currentSeconds,
    officialTargetSeconds,
  });

  const backendProgress =
    asFiniteNumber(
      hero?.progressPercent,
    );

  const displayedProgress =
    isStretchTarget &&
    currentSeconds !== null &&
    displayedTargetSeconds !== null &&
    displayedTargetSeconds > 0
      ? clampPercent(
          (
            currentSeconds /
            displayedTargetSeconds
          ) * 100,
        )
      : clampPercent(
          backendProgress,
        );

  const targetLabel =
    isStretchTarget
      ? "Your next target"
      : identity.currentPriority === "P1"
        ? "Safe target"
        : "Next priority target";

  return (
    <section className="rounded-[28px] border border-[#FDD9CE] bg-gradient-to-br from-[#FEEEE9] to-white px-5 py-6 shadow-[0_4px_14px_rgba(62,35,25,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-4 inline-flex rounded-full border border-[#F7B9A7] bg-white px-3 py-1.5 text-[13px] font-bold text-[#F45722] shadow-sm">
            {priority
              ? `Priority ${priority}`
              : "Your Priority"}
          </div>

          <h1 className="text-[27px] font-bold leading-tight tracking-[-0.02em] text-[#111827]">
            {greeting}
          </h1>
        </div>
      </div>

      {hero?.message ? (
        <p className="mt-4 text-[17px] leading-7 text-[#3F4653]">
          {hero.message}
        </p>
      ) : null}

      {(
        currentSeconds !== null ||
        displayedTargetSeconds !== null
      ) ? (
        <div className="mt-6 rounded-2xl border border-[#FDD9CE] bg-white/80 p-4">
          <p className="text-[14px] font-semibold text-[#68758A]">
            Average Talk Time
          </p>

          {displayedProgress !== null ? (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between gap-3 text-[13px] text-[#68758A]">
                <span>
                  Progress to target
                </span>

                <span className="font-bold text-[#111827]">
                  {Math.round(
                    displayedProgress,
                  )}
                  %
                </span>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-[#FDD9CE]">
                <div
                  className="h-full rounded-full bg-[#F45722] transition-[width] duration-500"
                  style={{
                    width:
                      `${displayedProgress}%`,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-[#FEEEE9] px-3 py-3">
              <p className="text-[12px] font-medium text-[#68758A]">
                Current
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#111827]">
                {formatSeconds(
                  currentSeconds,
                )}
              </p>
            </div>

            <div className="rounded-xl bg-[#FEEEE9] px-3 py-3">
              <p className="text-[12px] font-medium leading-4 text-[#68758A]">
                {targetLabel}
              </p>

              <p className="mt-1 text-[18px] font-bold text-[#111827]">
                {formatSeconds(
                  displayedTargetSeconds,
                )}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {hero?.motivation ? (
        <p className="mt-5 border-l-2 border-[#F45722] pl-3 text-[15px] italic leading-6 text-[#C84A27]">
          {hero.motivation}
        </p>
      ) : null}
    </section>
  );
}
