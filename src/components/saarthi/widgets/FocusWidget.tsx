import { useMemo, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
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

export function FocusWidget({
  focus,
}: Props) {
  const primary = focus?.primary ?? null;
  const secondary = useMemo(
    () => (focus?.secondary ?? []).filter(Boolean),
    [focus?.secondary],
  );

  if (!primary && secondary.length === 0) {
    return null;
  }

  return (
    <WidgetShell
      title="Today's Focus"
      subtitle="Your most important actions for today"
      tone="primary"
    >
      {primary ? <PrimaryFocus item={primary} /> : null}

      {secondary.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Also focus on
          </p>

          <ul className="space-y-2">
            {secondary.map((item, index) => (
              <SecondaryFocus
                key={item.id ?? `${item.type}-${index}`}
                item={item}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </WidgetShell>
  );
}

function PrimaryFocus({
  item,
}: {
  item: SaarthiFocusItem;
}) {
  const metricType = getMetricType(item);
  const valueSummary = buildValueSummary(item, metricType);
  const statusLabel = formatStatus(item.status);
  const hasCta = Boolean(item.ctaLabel) || Boolean(item.ctaTarget);

  const handleClick = () => {
    if (!hasCta) return;
    handleFocusCta(item.ctaTarget, item);
  };

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
                {getMetricHeading(metricType)}
              </p>

              <h3 className="mt-0.5 text-base font-semibold leading-snug text-foreground">
                {item.title || "Today's Focus"}
              </h3>
            </div>

            {statusLabel ? (
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {statusLabel}
              </span>
            ) : null}
          </div>

          {item.body ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.body}
            </p>
          ) : null}

          {valueSummary ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {valueSummary.current ? (
                <MetricValue
                  label={valueSummary.current.label}
                  value={valueSummary.current.value}
                />
              ) : null}

              {valueSummary.target ? (
                <MetricValue
                  label={valueSummary.target.label}
                  value={valueSummary.target.value}
                />
              ) : null}
            </div>
          ) : null}

          {hasCta ? (
            <button
              type="button"
              onClick={handleClick}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {item.ctaLabel || "Show Me How"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SecondaryFocus({
  item,
}: {
  item: SaarthiFocusItem;
}) {
  const [expanded, setExpanded] = useState(false);

  const metricType = getMetricType(item);
  const valueSummary = buildValueSummary(item, metricType);
  const hasDetails =
    Boolean(item.body) ||
    Boolean(valueSummary) ||
    Boolean(item.ctaLabel) ||
    Boolean(item.ctaTarget);

  const hasCta = Boolean(item.ctaLabel) || Boolean(item.ctaTarget);

  return (
    <li className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => hasDetails && setExpanded((current) => !current)}
        disabled={!hasDetails}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40 disabled:cursor-default disabled:hover:bg-transparent"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {getMetricHeading(metricType)}
          </p>

          <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
            {item.title || "Improve this metric"}
          </p>
        </div>

        {hasDetails ? (
          expanded ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>

      {expanded ? (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {item.body ? (
            <p className="text-sm leading-6 text-muted-foreground">
              {item.body}
            </p>
          ) : null}

          {valueSummary ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {valueSummary.current ? (
                <MetricValue
                  label={valueSummary.current.label}
                  value={valueSummary.current.value}
                />
              ) : null}

              {valueSummary.target ? (
                <MetricValue
                  label={valueSummary.target.label}
                  value={valueSummary.target.value}
                />
              ) : null}
            </div>
          ) : null}

          {hasCta ? (
            <button
              type="button"
              onClick={() => handleFocusCta(item.ctaTarget, item)}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {item.ctaLabel || "View Details"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ) : null}
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
  return String(item.type || "general").trim().toLowerCase();
}

function getMetricHeading(
  type: FocusMetricType,
): string {
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
  const current = formatMetricValue(item.currentValue, type);
  const target = formatMetricValue(item.targetValue, type);

  if (!current && !target) {
    return null;
  }

  if (type === "rank") {
    return {
      current: current
        ? {
            label: "Current rank",
            value: current,
          }
        : undefined,
      target: current
        ? {
            label: "Today's goal",
            value: "Improve your position",
          }
        : undefined,
    };
  }

  return {
    current: current
      ? {
          label: "Current",
          value: current,
        }
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
  if (value === null || value === undefined || value === "") {
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

function handleFocusCta(
  target: unknown,
  item: SaarthiFocusItem,
): void {
  const normalizedTarget = String(target || "").trim();

  if (/^https?:\/\//i.test(normalizedTarget)) {
    window.open(
      normalizedTarget,
      "_blank",
      "noopener,noreferrer",
    );
    return;
  }

  if (normalizedTarget.startsWith("#")) {
    document
      .querySelector(normalizedTarget)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    return;
  }

  window.dispatchEvent(
    new CustomEvent("saarthi:cta", {
      detail: {
        target: normalizedTarget || null,
        focusType: item.type || null,
        focusId: item.id || null,
        title: item.title || null,
      },
    }),
  );
}
