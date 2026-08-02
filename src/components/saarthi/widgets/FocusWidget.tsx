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
  SaarthiFocusMetricType,
} from "@/types/saarthi";

interface Props {
  expertId: number | string;
  focus?: SaarthiFocus | null;
  size?: "small" | "medium" | "large";
}

const METRIC_HEADINGS: Record<SaarthiFocusMetricType, string> = {
  talk_time: "Average Talk Time",
  availability: "Online Time",
  repeat: "Repeat Users",
};

const DEFAULT_ACTION_TITLES: Record<SaarthiFocusMetricType, string> = {
  talk_time: "Keep consultations useful for longer",
  availability: "Stay online during demand hours",
  repeat: "Bring more users back",
};

const STATUS_LABELS: Record<string, string> = {
  above_target: "On track",
  improving: "Improving",
  stable: "Stable",
  needs_attention: "Needs attention",
  insufficient_data: "Not enough data",
};

const ALLOWED_FOCUS_TYPES: SaarthiFocusMetricType[] = [
  "talk_time",
  "availability",
  "repeat",
];

export function FocusWidget({ expertId, focus }: Props) {
  const primary = useMemo(
    () => sanitizeFocusItem(focus?.primary),
    [focus?.primary],
  );

  const secondary = useMemo(() => {
    const primaryType = primary?.type;

    return (focus?.secondary ?? [])
      .map(sanitizeFocusItem)
      .filter((item): item is SaarthiFocusItem => item !== null)
      .filter((item) => item.type !== primaryType)
      .filter(
        (item, index, items) =>
          items.findIndex((candidate) => candidate.type === item.type) === index,
      )
      .slice(0, 2);
  }, [focus?.secondary, primary?.type]);

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
          <PrimaryFocus
            item={primary}
            onOpenGuide={() => setGuideItem(primary)}
          />
        ) : null}

        {secondary.length > 0 ? (
          <div className="mt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Also focus on
            </p>

            <div className="grid grid-cols-2 gap-2">
              {secondary.map((item) => (
                <SecondaryFocus
                  key={item.type}
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
          {valueSummary.current ? <MetricValue {...valueSummary.current} /> : null}
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
              key={`${action.id || action.text}-${index}`}
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

function sanitizeFocusItem(
  item: SaarthiFocusItem | null | undefined,
): SaarthiFocusItem | null {
  if (!item) return null;

  const type = String(item.type || item.id || "")
    .trim()
    .toLowerCase() as SaarthiFocusMetricType;

  if (!ALLOWED_FOCUS_TYPES.includes(type)) return null;

  return {
    ...item,
    id: type,
    type,
  };
}

function getMetricType(item: SaarthiFocusItem): SaarthiFocusMetricType {
  return item.type ?? "talk_time";
}

function getMetricHeading(type: SaarthiFocusMetricType): string {
  return METRIC_HEADINGS[type];
}

function getActionTitle(
  item: SaarthiFocusItem,
  type: SaarthiFocusMetricType,
): string {
  if (item.title && item.title !== "Today's Focus") return item.title;

  return DEFAULT_ACTION_TITLES[type];
}

function buildValueSummary(
  item: SaarthiFocusItem,
  type: SaarthiFocusMetricType,
): {
  current?: { label: string; value: string };
  target?: { label: string; value: string };
} | null {
  const current = formatMetricValue(item.currentValue, type);
  const target = formatMetricValue(item.targetValue, type);

  if (!current && !target) return null;

  return {
    current: current
      ? {
          label: type === "talk_time" ? "Current ATT" : "Current",
          value: current,
        }
      : undefined,
    target: target
      ? {
          label: "Target",
          value: target,
        }
      : undefined,
  };
}

function formatMetricValue(
  value: unknown,
  type: SaarthiFocusMetricType,
): string | null {
  if (value === null || value === undefined || value === "") return null;

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return String(value);

  switch (type) {
    case "talk_time":
      return formatSeconds(numericValue);
    case "availability":
      return formatMinutes(numericValue);
    case "repeat":
      return `${formatNumber(numericValue)} users`;
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
  return STATUS_LABELS[normalized] || toTitleCase(normalized);
}

function toTitleCase(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}
