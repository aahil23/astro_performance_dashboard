import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  X,
} from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import type {
  SaarthiFocus,
  SaarthiFocusItem,
} from "@/types/saarthi";

interface Props {
  focus?: SaarthiFocus | null;
  size?: "small" | "medium" | "large";
}

type FocusMetricType =
  | "talk_time"
  | "pickup"
  | "availability"
  | "busy_time"
  | "utilisation"
  | "repeat"
  | "loyal"
  | "missed_requests"
  | "rank"
  | "earnings"
  | "general"
  | string;

interface GuideContent {
  title: string;
  intro: string;
  steps: string[];
}

export function FocusWidget({
  focus,
}: Props) {
  const primary = focus?.primary ?? null;

  const secondary = useMemo(
    () =>
      (focus?.secondary ?? [])
        .filter(Boolean)
        .slice(0, 4),
    [focus?.secondary],
  );

  const [guideItem, setGuideItem] =
    useState<SaarthiFocusItem | null>(
      null,
    );

  if (
    !primary &&
    secondary.length === 0
  ) {
    return null;
  }

  return (
    <>
      <WidgetShell
        title="Today's Focus"
        subtitle="Your most important actions for today"
        tone="primary"
      >
        {primary ? (
          <PrimaryFocus
            item={primary}
            onOpenGuide={() =>
              setGuideItem(primary)
            }
          />
        ) : null}

        {secondary.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Also focus on
            </p>

            <ul className="space-y-2">
              {secondary.map(
                (item, index) => (
                  <SecondaryFocus
                    key={
                      item.id ??
                      `${item.type}-${index}`
                    }
                    item={item}
                    onOpenGuide={() =>
                      setGuideItem(item)
                    }
                  />
                ),
              )}
            </ul>
          </div>
        ) : null}
      </WidgetShell>

      {guideItem ? (
        <FocusGuideSheet
          item={guideItem}
          onClose={() =>
            setGuideItem(null)
          }
        />
      ) : null}
    </>
  );
}

function PrimaryFocus({
  item,
  onOpenGuide,
}: {
  item: SaarthiFocusItem;
  onOpenGuide: () => void;
}) {
  const metricType =
    getMetricType(item);

  const valueSummary =
    buildValueSummary(
      item,
      metricType,
    );

  const statusLabel =
    formatStatus(item.status);

  const actionableTitle =
    getActionTitle(
      item,
      metricType,
    );

  const actionableBody =
    getActionBody(
      item,
      metricType,
    );

  return (
    <article className="rounded-2xl border border-primary/15 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Target className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                {getMetricHeading(
                  metricType,
                )}
              </p>

              <h3 className="mt-0.5 text-base font-semibold leading-snug text-foreground">
                {actionableTitle}
              </h3>
            </div>

            {statusLabel ? (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {statusLabel}
              </span>
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {actionableBody}
          </p>

          {valueSummary ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {valueSummary.current ? (
                <MetricValue
                  label={
                    valueSummary
                      .current.label
                  }
                  value={
                    valueSummary
                      .current.value
                  }
                />
              ) : null}

              {valueSummary.target ? (
                <MetricValue
                  label={
                    valueSummary
                      .target.label
                  }
                  value={
                    valueSummary
                      .target.value
                  }
                />
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onOpenGuide}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {item.ctaLabel ||
              "Show Me How"}

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

function SecondaryFocus({
  item,
  onOpenGuide,
}: {
  item: SaarthiFocusItem;
  onOpenGuide: () => void;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const metricType =
    getMetricType(item);

  const valueSummary =
    buildValueSummary(
      item,
      metricType,
    );

  const title =
    getActionTitle(
      item,
      metricType,
    );

  const body =
    getActionBody(
      item,
      metricType,
    );

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() =>
          setExpanded(
            current => !current,
          )
        }
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {getMetricHeading(
              metricType,
            )}
          </p>

          <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
            {title}
          </p>
        </div>

        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {body}
          </p>

          {valueSummary ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {valueSummary.current ? (
                <MetricValue
                  label={
                    valueSummary
                      .current.label
                  }
                  value={
                    valueSummary
                      .current.value
                  }
                />
              ) : null}

              {valueSummary.target ? (
                <MetricValue
                  label={
                    valueSummary
                      .target.label
                  }
                  value={
                    valueSummary
                      .target.value
                  }
                />
              ) : null}
            </div>
          ) : null}

          <button
            type="button"
            onClick={onOpenGuide}
            className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {item.ctaLabel ||
              "Show Me How"}

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </li>
  );
}

function FocusGuideSheet({
  item,
  onClose,
}: {
  item: SaarthiFocusItem;
  onClose: () => void;
}) {
  const type =
    getMetricType(item);

  const guide =
    getGuideContent(type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-3 pb-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={guide.title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] bg-background p-5 shadow-2xl"
        onClick={event =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {
                getMetricHeading(
                  type,
                )
              }
            </p>

            <h3 className="mt-1 text-xl font-bold text-foreground">
              {guide.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {guide.intro}
        </p>

        <ol className="mt-4 space-y-3">
          {guide.steps.map(
            (step, index) => (
              <li
                key={step}
                className="flex gap-3 rounded-xl bg-muted/50 p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>

                <p className="pt-0.5 text-sm leading-5 text-foreground">
                  {step}
                </p>
              </li>
            ),
          )}
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 min-h-11 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Got It
        </button>
      </div>
    </div>
  );
}

function MetricValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <p className="text-[11px] font-medium text-muted-foreground">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {value}
      </p>
    </div>
  );
}

function getMetricType(
  item: SaarthiFocusItem,
): FocusMetricType {
  return String(
    item.type || "general",
  )
    .trim()
    .toLowerCase();
}

function getMetricHeading(
  type: FocusMetricType,
): string {
  const headings: Record<
    string,
    string
  > = {
    talk_time:
      "Average Talk Time",
    pickup:
      "Pickup Rate",
    availability:
      "Online Time",
    busy_time:
      "Busy Time",
    utilisation:
      "Utilisation",
    repeat:
      "Repeat Users",
    loyal:
      "Loyal Users",
    missed_requests:
      "Missed Requests",
    rank:
      "Cohort Ranking",
    earnings:
      "Earnings",
    general:
      "Performance",
  };

  return (
    headings[type] ||
    toTitleCase(type)
  );
}

function getActionTitle(
  item: SaarthiFocusItem,
  type: FocusMetricType,
): string {
  const titles: Record<
    string,
    string
  > = {
    talk_time:
      "Keep consultations useful for longer",
    pickup:
      "Pick more booking requests",
    availability:
      "Stay online during demand hours",
    busy_time:
      "Increase your active consultation time",
    utilisation:
      "Convert more online time into consultations",
    repeat:
      "Bring more users back",
    loyal:
      "Build stronger user trust",
    missed_requests:
      "Reduce missed booking requests",
    rank:
      "Improve your position in the cohort",
    earnings:
      "Increase your daily earnings",
    general:
      "Improve today's performance",
  };

  return (
    titles[type] ||
    item.title ||
    "Improve this metric"
  );
}

function getActionBody(
  item: SaarthiFocusItem,
  type: FocusMetricType,
): string {
  const bodies: Record<
    string,
    string
  > = {
    talk_time:
      "Ask one more relevant question and give a clear answer before ending the consultation.",
    pickup:
      "Keep the app open and respond quickly when a booking request comes in.",
    availability:
      "Add more online time during the hours when users are most active.",
    busy_time:
      "Stay available and focus on starting more completed consultations.",
    utilisation:
      "Reduce idle online time by responding quickly and staying active during high-demand hours.",
    repeat:
      "End each consultation with a clear next step so users know when to return.",
    loyal:
      "Give specific, useful guidance and remember the user's main concern.",
    missed_requests:
      "Keep notifications on and avoid leaving the app during your available hours.",
    rank:
      "Improve the metrics that matter most today. Your rank will improve as your overall performance improves.",
    earnings:
      "Increase online time, pickup and consultation quality to grow earnings steadily.",
    general:
      "Focus on one clear improvement today and repeat it consistently.",
  };

  return (
    bodies[type] ||
    item.body ||
    "Work on this metric today."
  );
}

function getGuideContent(
  type: FocusMetricType,
): GuideContent {
  const guides: Record<
    string,
    GuideContent
  > = {
    talk_time: {
      title:
        "Improve Average Talk Time",
      intro:
        "Keep the conversation useful. Do not extend it without giving value.",
      steps: [
        "Ask one relevant follow-up question about the user's current situation.",
        "Give one clear insight with a simple reason before moving to the next point.",
        "End only after confirming that the user's main question has been answered.",
      ],
    },

    pickup: {
      title:
        "Improve Pickup Rate",
      intro:
        "Fast response helps you receive more completed consultations.",
      steps: [
        "Keep notifications and sound on while you are marked available.",
        "Open booking requests quickly instead of switching between apps.",
        "Go offline when you cannot take requests so fewer bookings are missed.",
      ],
    },

    availability: {
      title:
        "Increase Online Time",
      intro:
        "More useful online time gives you more chances to receive bookings.",
      steps: [
        "Plan fixed online slots instead of logging in for many short periods.",
        "Prioritise morning and evening demand hours.",
        "Stay online only when you can respond quickly to new requests.",
      ],
    },

    busy_time: {
      title:
        "Increase Busy Time",
      intro:
        "Busy time grows when more of your online time turns into completed consultations.",
      steps: [
        "Stay online during the hours where you usually receive bookings.",
        "Pick requests quickly and avoid missing the first response window.",
        "Use strong consultation quality so users continue for longer.",
      ],
    },

    utilisation: {
      title:
        "Improve Utilisation",
      intro:
        "Use your online hours more effectively.",
      steps: [
        "Be online during high-demand hours rather than low-demand periods.",
        "Respond quickly to booking requests.",
        "Reduce long idle periods by adjusting availability when you are busy elsewhere.",
      ],
    },

    repeat: {
      title:
        "Increase Repeat Users",
      intro:
        "Users return when they receive clear value and know what to do next.",
      steps: [
        "Summarise the main guidance before ending.",
        "Give a practical next step that the user can follow.",
        "Tell the user when it would be useful to reconnect without making false promises.",
      ],
    },

    loyal: {
      title:
        "Build Loyal Users",
      intro:
        "Loyal users come back because they trust the quality and consistency of your guidance.",
      steps: [
        "Listen carefully and refer to the user's exact concern.",
        "Avoid generic answers and give one specific useful insight.",
        "Keep your guidance consistent when the same user returns.",
      ],
    },

    missed_requests: {
      title:
        "Reduce Missed Requests",
      intro:
        "Fewer missed requests can improve pickup and visibility.",
      steps: [
        "Keep notifications enabled while you are available.",
        "Do not remain available when you cannot respond.",
        "Check network quality before starting your online slot.",
      ],
    },

    rank: {
      title:
        "Improve Your Rank",
      intro:
        "Rank improves when your underlying performance metrics improve.",
      steps: [
        "Work first on the primary focus shown in this dashboard.",
        "Maintain strong pickup and availability.",
        "Improve consultation quality and repeat-user outcomes consistently.",
      ],
    },

    earnings: {
      title:
        "Increase Earnings",
      intro:
        "Earnings grow through better availability, pickup and consultation quality.",
      steps: [
        "Add online time during high-demand hours.",
        "Pick more requests and reduce missed bookings.",
        "Improve consultation quality so users stay longer and return.",
      ],
    },

    general: {
      title:
        "Improve Today's Performance",
      intro:
        "Choose one action and repeat it consistently today.",
      steps: [
        "Review your current and target values.",
        "Focus on the single biggest gap first.",
        "Check the dashboard again after your next set of consultations.",
      ],
    },
  };

  return (
    guides[type] ||
    guides.general
  );
}

function buildValueSummary(
  item: SaarthiFocusItem,
  type: FocusMetricType,
):
  | {
      current?: {
        label: string;
        value: string;
      };
      target?: {
        label: string;
        value: string;
      };
    }
  | null {
  const current =
    formatMetricValue(
      item.currentValue,
      type,
    );

  const target =
    formatMetricValue(
      item.targetValue,
      type,
    );

  if (
    !current &&
    !target
  ) {
    return null;
  }

  if (type === "rank") {
    return {
      current: current
        ? {
            label:
              "Current rank",
            value: current,
          }
        : undefined,

      target: {
        label:
          "Today's goal",
        value:
          "Improve key metrics",
      },
    };
  }

  return {
    current: current
      ? {
          label:
            "Current",
          value: current,
        }
      : undefined,

    target: target
      ? {
          label:
            type ===
            "missed_requests"
              ? "Maximum"
              : "Target",
          value: target,
        }
      : undefined,
  };
}

function formatMetricValue(
  value: unknown,
  type: FocusMetricType,
): string | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue,
    )
  ) {
    return String(value);
  }

  switch (type) {
    case "talk_time":
      return formatSeconds(
        numericValue,
      );

    case "availability":
    case "busy_time":
      return formatMinutes(
        numericValue,
      );

    case "pickup":
    case "utilisation":
    case "repeat":
    case "loyal":
      return `${formatNumber(
        numericValue,
      )}%`;

    case "earnings":
      return new Intl.NumberFormat(
        "en-IN",
        {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        },
      ).format(
        numericValue,
      );

    case "rank":
      return `#${Math.max(
        1,
        Math.round(
          numericValue,
        ),
      )}`;

    default:
      return formatNumber(
        numericValue,
      );
  }
}

function formatSeconds(
  seconds: number,
): string {
  const rounded =
    Math.max(
      0,
      Math.round(seconds),
    );

  const minutes =
    Math.floor(
      rounded / 60,
    );

  const remainingSeconds =
    rounded % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (
    remainingSeconds === 0
  ) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatMinutes(
  minutes: number,
): string {
  const rounded =
    Math.max(
      0,
      Math.round(minutes),
    );

  const hours =
    Math.floor(
      rounded / 60,
    );

  const remainingMinutes =
    rounded % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (
    remainingMinutes === 0
  ) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatNumber(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-IN",
    {
      maximumFractionDigits: 1,
    },
  ).format(value);
}

function formatStatus(
  status: unknown,
): string | null {
  if (!status) {
    return null;
  }

  const normalized =
    String(status)
      .trim()
      .toLowerCase();

  const labels: Record<
    string,
    string
  > = {
    above_target:
      "On track",
    improving:
      "Improving",
    stable:
      "Stable",
    needs_attention:
      "Needs attention",
    insufficient_data:
      "Not enough data",
  };

  return (
    labels[normalized] ||
    toTitleCase(
      normalized.replace(
        /_/g,
        " ",
      ),
    )
  );
}

function toTitleCase(
  value: string,
): string {
  return value
    .replace(/_/g, " ")
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase(),
    );
}
