import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  X,
} from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import {
  hasCoachingActions,
  selectDailyCoachingActions,
} from "@/lib/saarthiCoaching";
import type {
  SaarthiCoachingAction,
  SaarthiFocus,
  SaarthiFocusItem,
} from "@/types/saarthi";

interface Props {
  expertId: number | string;
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

export function FocusWidget({
  expertId,
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
    useState<SaarthiFocusItem | null>(null);

  if (!primary && secondary.length === 0) {
    return null;
  }

  return (
    <>
      <WidgetShell
        title="Today's Focus"
        subtitle="What will move your priority forward"
        tone="primary"
      >
        {primary ? (
          <PrimaryFocus
            item={primary}
            onOpenGuide={() => setGuideItem(primary)}
          />
        ) : null}

        {secondary.length > 0 ? (
          <div className="mt-4 border-t border-border/60 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Also focus on
            </p>

            <div className="overflow-hidden rounded-xl border border-border/60 bg-background/70">
              {secondary.map((item, index) => (
                <SecondaryFocus
                  key={item.id || item.type || index}
                  item={item}
                  onOpenGuide={() => setGuideItem(item)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </WidgetShell>

      {guideItem ? (
        <FocusGuideSheet
          expertId={expertId}
          item={guideItem}
          onClose={() => setGuideItem(null)}
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
  const metricType = getMetricType(item);
  const valueSummary = buildValueSummary(item, metricType);
  const statusLabel = formatStatus(item.status);
  const actionableTitle = getActionTitle(item, metricType);
  const actionableBody = item.body || null;
  const canOpenGuide = hasCoachingActions(item);

  return (
    <div className="rounded-xl border border-primary/15 bg-background/70 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
          <Target className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            {getMetricHeading(metricType)}
          </p>

          <h4 className="mt-1 text-base font-semibold leading-snug text-foreground">
            {actionableTitle}
          </h4>

          {statusLabel ? (
            <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
              {statusLabel}
            </span>
          ) : null}

          {actionableBody ? (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {actionableBody}
            </p>
          ) : null}

          {valueSummary ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {valueSummary.current ? (
                <MetricValue {...valueSummary.current} />
              ) : null}

              {valueSummary.target ? (
                <MetricValue {...valueSummary.target} />
              ) : null}
            </div>
          ) : null}

          {canOpenGuide ? (
            <button
              type="button"
              onClick={onOpenGuide}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.ctaLabel || "Show Me How"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SecondaryFocus({
  item,
  onOpenGuide,
}: {
  item: SaarthiFocusItem;
  onOpenGuide: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const metricType = getMetricType(item);
  const valueSummary = buildValueSummary(item, metricType);
  const title = getActionTitle(item, metricType);
  const canOpenGuide = hasCoachingActions(item);

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {getMetricHeading(metricType)}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
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
        <div className="px-4 pb-4">
          {item.body ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {item.body}
            </p>
          ) : null}

          {valueSummary ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {valueSummary.current ? (
                <MetricValue {...valueSummary.current} />
              ) : null}

              {valueSummary.target ? (
                <MetricValue {...valueSummary.target} />
              ) : null}
            </div>
          ) : null}

          {canOpenGuide ? (
            <button
              type="button"
              onClick={onOpenGuide}
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.ctaLabel || "Show Me How"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function FocusGuideSheet({
  expertId,
  item,
  onClose,
}: {
  expertId: number | string;
  item: SaarthiFocusItem;
  onClose: () => void;
}) {
  const type = getMetricType(item);

  const actions = useMemo(
    () => selectDailyCoachingActions(expertId, item, 3),
    [expertId, item],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-0 sm:items-center sm:px-4"
      role="presentation"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="saarthi-coaching-title"
        className="max-h-[88vh] w-full max-w-[620px] overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted sm:hidden" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {getMetricHeading(type)}
            </p>
            <h3
              id="saarthi-coaching-title"
              className="mt-1 text-xl font-semibold text-foreground"
            >
              What to do today
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try these three actions during your next consultations.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close coaching guide"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ol className="mt-5 space-y-3">
          {actions.map((action, index) => (
            <CoachingActionRow
              key={action.id}
              action={action}
              index={index}
            />
          ))}
        </ol>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 min-h-11 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Got It
        </button>
      </section>
    </div>
  );
}

function CoachingActionRow({
  action,
  index,
}: {
  action: SaarthiCoachingAction;
  index: number;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-border/70 bg-muted/25 p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {index + 1}
      </span>

      <div className="min-w-0">
        {action.category ? (
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {toTitleCase(action.category)}
          </p>
        ) : null}

        <p className="mt-1 text-sm leading-6 text-foreground">
          {action.text}
        </p>
      </div>
    </li>
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
    <div className="rounded-lg bg-muted/50 px-3 py-2">
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
  return String(item.type || item.id || "general")
    .trim()
    .toLowerCase();
}

function getMetricHeading(type: FocusMetricType): string {
  const headings: Record<string, string> = {
    talk_time: "Average Talk Time",
    pickup: "Pickup Rate",
    availability: "Online Time",
    busy_time: "Busy Time",
    utilisation: "Utilisation",
    repeat: "Repeat Users",
    loyal: "Loyal Users",
    missed_requests: "Missed Requests",
    rank: "Cohort Ranking",
    earnings: "Earnings",
    general: "Performance",
  };

  return headings[type] || toTitleCase(type);
}

function getActionTitle(
  item: SaarthiFocusItem,
  type: FocusMetricType,
): string {
  if (item.title && item.title !== "Today's Focus") {
    return item.title;
  }

  const titles: Record<string, string> = {
    talk_time: "Keep consultations useful for longer",
    pickup: "Pick more booking requests",
    availability: "Stay online during demand hours",
    busy_time: "Increase your active consultation time",
    utilisation: "Convert more online time into consultations",
    repeat: "Bring more users back",
    loyal: "Build stronger user trust",
    missed_requests: "Reduce missed booking requests",
    rank: "Improve your position in the cohort",
    earnings: "Increase your daily earnings",
    general: "Improve today's performance",
  };

  return titles[type] || "Improve this metric";
}

function buildValueSummary(
  item: SaarthiFocusItem,
  type: FocusMetricType,
):
  | {
      current?: { label: string; value: string };
      target?: { label: string; value: string };
    }
  | null {
  const current = formatMetricValue(item.currentValue, type);
  const target = formatMetricValue(item.targetValue, type);

  if (!current && !target) {
    return null;
  }

  if (type === "rank") {
    return {
      current: current
        ? { label: "Current rank", value: current }
        : undefined,
      target: {
        label: "Today's goal",
        value: "Improve key metrics",
      },
    };
  }

  return {
    current: current
      ? { label: "Current", value: current }
      : undefined,
    target: target
      ? {
          label:
            type === "missed_requests"
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

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return String(value);
  }

  switch (type) {
    case "talk_time":
      return formatSeconds(numericValue);

    case "availability":
    case "busy_time":
      return formatMinutes(numericValue);

    case "pickup":
    case "utilisation":
    case "repeat":
    case "loyal":
      return `${formatNumber(numericValue)}%`;

    case "earnings":
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(numericValue);

    case "rank":
      return `#${Math.max(1, Math.round(numericValue))}`;

    default:
      return formatNumber(numericValue);
  }
}

function formatSeconds(seconds: number): string {
  const rounded = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatStatus(status: unknown): string | null {
  if (!status) {
    return null;
  }

  const normalized = String(status)
    .trim()
    .toLowerCase();

  const labels: Record<string, string> = {
    above_target: "On track",
    improving: "Improving",
    stable: "Stable",
    needs_attention: "Needs attention",
    insufficient_data: "Not enough data",
  };

  return (
    labels[normalized] ||
    toTitleCase(normalized.replace(/_/g, " "))
  );
}

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}
