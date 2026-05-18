import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  getMetricDescription,
  type Funnel,
  type FunnelMetric,
  type WeeklyFunnelTrends as WeeklyFunnelTrendsData,
} from "@/services/dashboardApi";
import { cn } from "@/lib/utils";

interface Props {
  data: WeeklyFunnelTrendsData;
}

export function WeeklyFunnelTrends({ data }: Props) {
  const funnels = data?.funnels ?? [];
  if (!funnels.length) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-bold tracking-tight text-foreground">
        Weekly Funnel Trends
      </h2>

      <div className="space-y-5">
        {funnels.map((funnel, idx) => (
          <FunnelCarousel key={`${funnel.type}-${idx}`} funnel={funnel} />
        ))}
      </div>
    </section>
  );
}

function FunnelCarousel({ funnel }: { funnel: Funnel }) {
  const metrics = funnel.metrics ?? [];
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const onScroll = () => {
      const center = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let nearestDist = Infinity;

      cardRefs.current.forEach((c, i) => {
        if (!c) return;

        const cardCenter = c.offsetLeft + c.clientWidth / 2;
        const dist = Math.abs(center - cardCenter);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      });

      setActiveIdx(nearest);
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (i: number) => {
    const card = cardRefs.current[i];
    const el = scrollerRef.current;

    if (!card || !el) return;

    const left =
      card.offsetLeft - (el.clientWidth - card.clientWidth) / 2;

    el.scrollTo({
      left,
      behavior: "smooth",
    });
  };

  const isD0 = String(funnel.type).toLowerCase() === "d0";

  if (!metrics.length) return null;

  return (
    <div className="space-y-2">
      <div className="px-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              isD0 ? "bg-primary" : "bg-foreground/60",
            )}
          />

          <h3 className="text-sm font-semibold text-foreground">
            {funnel.title}
          </h3>
        </div>

        {funnel.subtitle && (
          <p className="ml-3.5 text-xs text-muted-foreground">
            {funnel.subtitle}
          </p>
        )}
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {metrics.map((m, i) => (
          <div
            key={m.metric_key}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="w-[88%] flex-none snap-center"
          >
            <FunnelMetricCard
              metric={m}
              metrics={metrics}
              activeIdx={activeIdx}
              onSelect={scrollTo}
              accent={isD0 ? "primary" : "neutral"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FunnelMetricCard({
  metric,
  metrics,
  activeIdx,
  onSelect,
  accent,
}: {
  metric: FunnelMetric;
  metrics: FunnelMetric[];
  activeIdx: number;
  onSelect: (i: number) => void;
  accent: "primary" | "neutral";
}) {
  const dir = String(metric.trend_direction ?? "").toLowerCase();

  const isUp = dir === "up";
  const isDown = dir === "down";

  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  const trendColor = isUp
    ? "text-[color:var(--status-strong)]"
    : isDown
      ? "text-[color:var(--status-critical)]"
      : "text-muted-foreground";

  const pct = Number(metric.trend_percentage) || 0;

  const pctStr = `${isUp ? "+" : isDown ? "−" : ""}${Math.abs(
    pct,
  ).toFixed(0)}%`;

  const description = getMetricDescription(metric.metric_key);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {metric.title}
          </h4>

          <p className="text-xs text-muted-foreground">
            {getMetricSubtitle(metric)}
          </p>
        </div>

        {/*
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium tabular-nums",
            trendColor,
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{pctStr}</span>
        </div>
        */}
      </div>

      <div className="mt-3">
        <Sparkline
          values={(metric.data ?? []).map((d) => Number(d.value) || 0)}
          accent={accent}
        />
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {(metric.data ?? []).map((d, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {d.weekday?.slice(0, 3)}
            </span>

            <span className="text-[11px] font-medium tabular-nums text-foreground">
              {formatCompact(Number(d.value) || 0)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-xs">
        <span className="text-muted-foreground">
          Avg{" "}
          <span className="font-medium text-foreground tabular-nums">
            {formatCompact(Number(metric.weekly_average) || 0)}
          </span>
        </span>

        <span className="text-muted-foreground">
          Best{" "}
          <span className="font-medium text-foreground">
            {metric.best_day?.slice(0, 3)}
          </span>
        </span>
      </div>

      {description && (
        <div className="mt-2 min-h-[56px]">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {metrics.map((m, i) => {
          const active = i === activeIdx;

          return (
            <button
              key={m.metric_key}
              type="button"
              onClick={() => onSelect(i)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                active
                  ? accent === "primary"
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground text-background"
                  : "border border-border/70 text-muted-foreground hover:text-foreground",
              )}
            >
              {m.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Sparkline({
  values,
  accent,
}: {
  values: number[];
  accent: "primary" | "neutral";
}) {
  const w = 280;
  const h = 56;
  const pad = 4;

  if (!values.length) {
    return <div className="h-14 w-full rounded-md bg-muted/40" />;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x =
      pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1);

    const y =
      h - pad - ((v - min) / span) * (h - pad * 2);

    return [x, y] as const;
  });

  const d = smoothPath(points);
  const last = points[points.length - 1];

  const stroke =
    accent === "primary" ? "var(--primary)" : "var(--foreground)";

  const fillId = `spark-fill-${accent}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="h-14 w-full"
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d={`${d} L ${last[0]} ${h - pad} L ${pad} ${h - pad} Z`}
        fill={`url(#${fillId})`}
      />

      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={last[0]} cy={last[1]} r={2.5} fill={stroke} />
    </svg>
  );
}

function smoothPath(pts: ReadonlyArray<readonly [number, number]>): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;

  let d = `M ${pts[0][0]} ${pts[0][1]}`;

  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];

    const mx = (x0 + x1) / 2;

    d += ` Q ${x0} ${y0} ${mx} ${(y0 + y1) / 2} T ${x1} ${y1}`;
  }

  return d;
}

function getMetricSubtitle(metric: FunnelMetric): string {
  const key = metric.metric_key || "";
  if (key.endsWith("_att")) return "Last 7 Days (In mins)";
  if (key.endsWith("_earnings")) return "Last 7 Days (In ₹)";
  return "Last 7 Days";
}

function formatCompact(n: number): string {
  const abs = Math.abs(n);

  if (abs >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }

  if (abs >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`;
  }

  if (Number.isInteger(n)) {
    return String(n);
  }

  return n.toFixed(1);
}
