import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Target, X } from "lucide-react";
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

export function FocusWidget({ expertId, focus }: Props) {
  const primary = focus?.primary ?? null;
  const secondary = useMemo(
    () => (focus?.secondary ?? []).filter(Boolean).slice(0, 4),
    [focus?.secondary],
  );
  const [guideItem, setGuideItem] = useState<SaarthiFocusItem | null>(null);

  if (!primary && secondary.length === 0) return null;

  return (
    <>
      <WidgetShell
        title="Today's Focus"
        subtitle="What will move your priority forward"
        tone="primary"
      >
        {primary ? (
          <PrimaryFocus item={primary} onOpenGuide={() => setGuideItem(primary)} />
        ) : null}

        {secondary.length > 0 ? (
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Also focus on
            </p>
            <div className="grid grid-cols-2 gap-2">
              {secondary.map((item, index) => (
                <SecondaryFocus
                  key={`${item.id || item.type || "focus"}-${index}`}
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
  const canOpenGuide = hasCoachingActions(item);

  return (
    <div className="rounded-xl border border-primary/20 bg-background/70 p-3">
      <div className="flex items-start gap-2.5">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
            {getMetricHeading(metricType)}
          </p>
          <h4 className="mt-0.5 text-sm font-bold leading-5 text-foreground">
            {getActionTitle(item, metricType)}
          </h4>
          {statusLabel ? (
            <span className="mt-1.5 inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {statusLabel}
            </span>
          ) : null}
          {item.body ? (
            <p className="mt-1.5 text-xs leading-4 text-muted-foreground">
              {item.body}
            </p>
          ) : null}
        </div>
      </div>

      {valueSummary ? (
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {valueSummary.current ? (
            <MetricValue {...valueSummary.current} />
          ) : null}
          {valueSummary.target ? <MetricValue {...valueSummary.target} /> : null}
        </div>
      ) : null}

      {canOpenGuide ? (
        <button
          type="button"
          onClick={onOpenGuide}
          className="mt-2.5 inline-flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {item.ctaLabel || "Show Me How"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      ) : null}
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
  const metricType = getMetricType(item);
  const canOpenGuide = hasCoachingActions(item);

  return (
    <button
      type="button"
      onClick={canOpenGuide ? onOpenGuide : undefined}
      disabled={!canOpenGuide}
      className="flex min-h-[96px] w-full flex-col rounded-xl border border-border/60 bg-background px-3 py-2.5 text-left transition-colors enabled:hover:bg-muted/40 enabled:focus-visible:outline-none enabled:focus-visible:ring-2 enabled:focus-visible:ring-primary disabled:cursor-default"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
        {getMetricHeading(metricType)}
      </p>
      <p className="mt-1 text-[clamp(11px,2.8vw,12px)] font-semibold leading-4 text-foreground">
        {getActionTitle(item, metricType)}
      </p>
      {canOpenGuide ? (
        <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[10px] font-semibold text-primary">
          {item.ctaLabel || "Show Me How"}
          <ArrowRight className="h-3 w-3" />
        </span>
      ) : null}
    </button>
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
  const metricType = getMetricType(item);
  const actions = useMemo(
    () => selectDailyCoachingActions(expertId, item, 3),
    [expertId, item],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
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

  if (actions.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/45"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="mx-auto w-full max-w-[760px] rounded-t-3xl bg-background p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={`${getMetricHeading(metricType)} coaching`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {getMetricHeading(metricType)}
            </p>
            <h3 className="mt-1 text-lg font-bold text-foreground">
              What to do today
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try these three actions during your next consultations.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {actions.map((action, index) => (
            <CoachingActionRow
              key={`${action.actionId || action.text}-${index}`}
              action={action}
              index={index}
            />
          ))}
        </div>

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

function CoachingActionRow({
  action,
  index,
}: {
  action: SaarthiCoachingAction;
  index: number;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        {index + 1}
      </div>
      <div className="min-w-0">
        {action.category ? (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {toTitleCase(action.category)}
          </p>
        ) : null}
        <p className="mt-0.5 text-sm leading-5 text-foreground">{action.text}</p>
      </div>
    </div>
  );
}

function MetricValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/35 px-3 py-2">
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold leading-tight text-foreground">
        {value}
      </p>
    </div>
  );
}

function getMetricType(item: SaarthiFocusItem): FocusMetricType {
  return String(item.type || item.id || "general").trim().toLowerCase();
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

function getActionTitle(item: SaarthiFocusItem, type: FocusMetricType): string {
  if (item.title && item.title !== "Today's Focus") return item.title;

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
): {
  current?: { label: string; value: string };
  target?: { label: string; value: string };
} | null {
  const current = formatMetricValue(item.currentValue, type);
  const target = formatMetricValue(item.targetValue, type);

  if (!current && !target) return null;

  if (type === "rank") {
    return {
      current: current ? { label: "Current rank", value: current } : undefined,
      target: { label: "Today's goal", value: "Improve key metrics" },
    };
  }

  return {
    current: current
      ? { label: type === "talk_time" ? "Current ATT" : "Current", value: current }
      : undefined,
    target: target
      ? {
          label: type === "missed_requests" ? "Maximum" : "Target",
          value: target,
        }
      : undefined,
  };
}

function formatMetricValue(
  value: unknown,
  type: FocusMetricType,
): string | null {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value);

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
  if (minutes === 0) return `${remainingSeconds}s`;
  if (remainingSeconds === 0) return `${minutes}m`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const remainingMinutes = rounded % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(value);
}

function formatStatus(status: unknown): string | null {
  if (!status) return null;
  const normalized = String(status).trim().toLowerCase();
  const labels: Record<string, string> = {
    above_target: "On track",
    improving: "Improving",
    stable: "Stable",
    needs_attention: "Needs attention",
    insufficient_data: "Not enough data",
  };
  return labels[normalized] || toTitleCase(normalized.replace(/_/g, " "));
}

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
