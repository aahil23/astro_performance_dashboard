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
    <section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 via-brand-soft to-card p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">
        {priorityLabel}
      </p>
      <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
        {greeting}
      </h2>
      {hero?.message && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {hero.message}
        </p>
      )}

      {progress !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-semibold text-foreground">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/60">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {(hero?.currentAtt || hero?.targetAtt) && (
            <p className="mt-2 text-xs text-muted-foreground">
              Current: <span className="font-medium text-foreground">{hero.currentAtt ?? "—"}</span>
              {" · "}
              Target: <span className="font-medium text-foreground">{hero.targetAtt ?? "—"}</span>
            </p>
          )}
        </div>
      )}

      {hero?.motivation && (
        <p className="mt-3 text-xs italic text-primary/90">{hero.motivation}</p>
      )}
    </section>
  );
}

function clampPercent(v: number | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}