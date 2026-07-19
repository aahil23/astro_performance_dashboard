import type { SaarthiHero, SaarthiIdentity } from "@/types/saarthi";

interface Props {
  identity: SaarthiIdentity;
  hero?: SaarthiHero | null;
}

export function HeroWidget({ identity, hero }: Props) {
  const greeting = hero?.greeting ?? `Namaste, ${identity.expertName}`;
  const priorityLabel =
    hero?.priorityLabel ?? identity.currentPriority ?? "Your Priority";
  const progress = clampPercent(hero?.progressPercent);

  return (
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-brand-soft p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {priorityLabel}
        </span>
        {progress !== null ? (
          <span className="text-xs font-medium text-muted-foreground">
            Progress {progress.toFixed(0)}%
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

      {progress !== null ? (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {hero?.currentAtt || hero?.targetAtt ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricBox label="Current" value={hero?.currentAtt ?? "—"} />
          <MetricBox label="Next target" value={hero?.targetAtt ?? "—"} />
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

function MetricBox({ label, value }: { label: string; value: string | number }) {
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

function clampPercent(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return null;
  return Math.max(0, Math.min(100, numericValue));
}
