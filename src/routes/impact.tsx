import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/dashboard/AppHeader";
import { cn } from "@/lib/utils";
import { usePageAnalytics } from "@/hooks/usePageAnalytics";

export const Route = createFileRoute("/impact")({
  component: ImpactPage,
});

function ImpactPage() {
  usePageAnalytics("impact_of_score");
  return (
    <div className="min-h-screen">
      <AppHeader
        title="Impact of Score"
        showHelp={false}
        backTo="/dashboard"
      />

      <main className="mx-auto max-w-md px-4 py-6">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">
              Why Your Scores Matter
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your dashboard scores help measure consultation quality,
              availability consistency, user retention, and platform trust.
              Better scores usually lead to stronger repeat behaviour, higher
              utilisation, and better long-term earnings potential.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="px-1 text-lg font-bold text-foreground">
              Understanding Performance Status
            </h3>

            <StatusCard
              title="Elite"
              color="elite"
              description="Top-performing experts in the metric."
              impacts={[
                "Strong repeat-user retention",
                "Higher consultation quality signals",
                "Better long-term earning potential",
                "Strong platform trust indicators",
              ]}
            />

            <StatusCard
              title="Strong"
              color="strong"
              description="Above-average performance compared to peers."
              impacts={[
                "Healthy user experience signals",
                "Good repeat engagement potential",
                "Consistent consultation quality",
              ]}
            />

            <StatusCard
              title="Average"
              color="average"
              description="Moderate performance with room for improvement."
              impacts={[
                "Stable performance baseline",
                "Some metrics may need optimisation",
                "Improvement opportunities available",
              ]}
            />

            <StatusCard
              title="Weak"
              color="weak"
              description="Metric is currently below the peer benchmark range."
              impacts={[
                "Lower repeat-user efficiency",
                "Possible drop in retention quality",
                "Availability or engagement gaps may exist",
              ]}
            />
          </section>

          <section className="space-y-3">
            <h3 className="px-1 text-lg font-bold text-foreground">
              Critical Performance Impact
            </h3>

            <ImpactCard
              title="D0 TTPU"
              impact="Higher D0 TTPU usually indicates stronger first-session engagement and better early user experience."
              positive={[
                "Users spend more time in first interactions",
                "Better probability of repeat consultations",
                "Stronger initial trust building",
              ]}
              caution={[
                "Very low D0 TTPU may indicate weak onboarding conversations.",
              ]}
            />

            <ImpactCard
              title="D14 TTPU"
              impact="D14 TTPU reflects long-term user retention quality and repeat engagement strength."
              positive={[
                "Users continue returning after first interaction",
                "Higher repeat engagement quality",
                "Better long-term earning consistency",
              ]}
              caution={[
                "Low D14 TTPU may indicate poor long-term retention.",
              ]}
            />
          </section>

          <section className="space-y-3">
            <h3 className="px-1 text-lg font-bold text-foreground">
              Availability Performance Impact
            </h3>

            <ImpactCard
              title="Availability Hours"
              impact="Availability directly affects discoverability and consultation opportunities."
              positive={[
                "Higher visibility opportunity",
                "Better chance of capturing demand",
                "Improved utilisation potential",
              ]}
              caution={[
                "Low availability limits consultation opportunities even if demand exists.",
              ]}
            />
          </section>

          <section className="space-y-3">
            <h3 className="px-1 text-lg font-bold text-foreground">
              Profile Performance Impact
            </h3>

            <ImpactCard
              title="Ratings"
              impact="Ratings reflect user satisfaction and consultation quality."
              positive={[
                "Higher trust perception",
                "Stronger repeat consultation potential",
                "Better user confidence",
              ]}
              caution={[
                "Consistently low ratings may reduce repeat engagement quality.",
              ]}
            />
          </section>

          <section className="space-y-3">
            <h3 className="px-1 text-lg font-bold text-foreground">
              Weekly Funnel Impact
            </h3>

            <ImpactCard
              title="New User Funnel (D0)"
              impact="Tracks how effectively you engage first-time users."
              positive={[
                "Healthy D0 users indicate strong acquisition flow",
                "Higher D0 ATT reflects deeper first-session engagement",
                "Higher D0 earnings indicate better new-user monetisation",
              ]}
              caution={[
                "Weak D0 metrics may affect long-term repeat growth.",
              ]}
            />

            <ImpactCard
              title="Repeat User Funnel (Dn)"
              impact="Tracks repeat-user retention and repeat consultation quality."
              positive={[
                "Higher repeat users reflect strong retention",
                "Higher Dn ATT indicates deeper ongoing engagement",
                "Higher Dn earnings improve revenue stability",
              ]}
              caution={[
                "Weak repeat-user trends may indicate retention leakage.",
              ]}
            />
          </section>

          <section className="space-y-3">
            <h3 className="px-1 text-lg font-bold text-foreground">
              Utilisation Impact
            </h3>

            <ImpactCard
              title="Utilisation"
              impact="Utilisation measures how efficiently online time converts into consultations."
              positive={[
                "Higher utilisation means stronger demand conversion",
                "Efficient use of online hours",
                "Better productivity efficiency",
              ]}
              caution={[
                "Very low utilisation may indicate weak traffic conversion or excess idle availability.",
              ]}
            />
          </section>

          <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">
              Important Note
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Scores should be viewed as directional performance indicators, not
              absolute judgments. Different experts operate in different
              categories, timings, languages, and user cohorts. Focus on
              improving your own consistency and long-term trends over time.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatusCard({
  title,
  description,
  impacts,
  color,
}: {
  title: string;
  description: string;
  impacts: string[];
  color: "elite" | "strong" | "average" | "weak";
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-foreground">{title}</h4>

          <p className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold text-white",
            color === "elite" && "bg-teal-700",
            color === "strong" && "bg-green-600",
            color === "average" && "bg-yellow-500",
            color === "weak" && "bg-red-500",
          )}
        >
          {title}
        </span>
      </div>

      <ul className="mt-4 list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
        {impacts.map((impact) => (
          <li key={impact}>{impact}</li>
        ))}
      </ul>
    </div>
  );
}

function ImpactCard({
  title,
  impact,
  positive,
  caution,
}: {
  title: string;
  impact: string;
  positive: string[];
  caution?: string[];
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <h4 className="text-base font-semibold text-foreground">{title}</h4>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {impact}
      </p>

      <div className="mt-4 rounded-xl bg-primary/10 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Positive Signals
        </p>

        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
          {positive.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {caution && caution.length > 0 && (
        <div className="mt-3 rounded-xl bg-red-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Watchouts
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground">
            {caution.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
