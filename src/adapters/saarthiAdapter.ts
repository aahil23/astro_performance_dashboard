import type {
  SaarthiData,
  SaarthiEarnings,
  SaarthiFocus,
  SaarthiFocusItem,
  SaarthiHero,
  SaarthiHighlight,
  SaarthiIdentity,
  SaarthiJourney,
  SaarthiJourneyStep,
  SaarthiLayoutItem,
  SaarthiMantra,
  SaarthiPerformance,
  SaarthiPerformanceMetric,
  SaarthiRanking,
  SaarthiRawContent,
  SaarthiRawData,
  SaarthiRawFocusItem,
  SaarthiRisk,
  SaarthiWidgetId,
} from "@/types/saarthi";

/**
 * Adapter layer: Apps Script response -> UI view model.
 *
 * This is the ONLY place that knows both the backend's raw field names and
 * the shape the existing Saarthi widgets expect. It performs no business
 * logic — it does not recompute priority, risk, focus scores, or widget
 * visibility. It only renames/reshapes fields and applies safe display
 * formatting (unit conversions), leaving all decisions to the backend.
 */

const KNOWN_WIDGET_IDS: SaarthiWidgetId[] = [
  "focus",
  "earnings",
  "performance",
  "highlight",
  "mantra",
  "priority_journey",
  "leaderboard",
  "risk_meter",
];

// Priority ladder used only to render step progress in the journey widget.
// This does not decide priority — it just orders the labels the backend
// already told us are current/next.
const PRIORITY_LADDER = ["P5", "P4", "P3", "P2", "P1"];

function isNil(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function secondsToDisplay(v: number | null | undefined): string | null {
  if (isNil(v) || Number.isNaN(Number(v))) return null;
  const n = Number(v);
  const mins = Math.floor(n / 60);
  const secs = Math.round(n % 60);
  return `${mins}m ${secs.toString().padStart(2, "0")}s`;
}

function mapIdentity(raw: SaarthiRawData): SaarthiIdentity {
  const identity = raw.identity;
  return {
    expertId: identity.expertId,
    expertName: identity.expertName,
    primaryLanguage: identity.primaryLanguage ?? undefined,
    currentPriority: identity.currentPriority ?? undefined,
    nextPriority: identity.nextPriority ?? undefined,
    variant: identity.variant ?? undefined,
  };
}

function mapHero(raw: SaarthiRawData): SaarthiHero | null {
  const hero = raw.hero;
  if (!hero) return null;
  return {
    greeting: hero.greeting ?? undefined,
    priorityLabel: hero.priority ?? undefined,
    message: hero.message ?? undefined,
    motivation: hero.motivation ?? undefined,
    progressPercent: hero.progressPct ?? null,
    currentAtt: hero.currentDisplay ?? null,
    targetAtt: hero.targetDisplay ?? null,
    gap: hero.gapDisplay ?? null,
  };
}

function mapFocusItem(item: SaarthiRawFocusItem | null | undefined): SaarthiFocusItem | null {
  if (!item) return null;
  return {
    id: item.type ?? undefined,
    title: item.title ?? undefined,
    body: item.body ?? undefined,
    currentValue: item.currentValue ?? null,
    targetValue: item.targetValue ?? null,
    status: item.status ?? null,
    ctaLabel: item.ctaLabel ?? undefined,
    ctaTarget: item.ctaTarget ?? undefined,
  };
}

function mapFocus(raw: SaarthiRawData): SaarthiFocus | null {
  const focus = raw.focus;
  if (!focus) return null;
  return {
    primary: mapFocusItem(focus.primary),
    secondary: (focus.secondary ?? [])
      .map(mapFocusItem)
      .filter((i): i is SaarthiFocusItem => i !== null),
  };
}

function mapEarnings(raw: SaarthiRawData): SaarthiEarnings | null {
  const earnings = raw.earnings;
  if (!earnings) return null;
  return {
    today: earnings.today ?? null,
    yesterday: earnings.yesterday ?? null,
    average7d: earnings.sevenDayAvg ?? null,
    currentBenchmark: earnings.currentPriorityBenchmark ?? null,
    nextBenchmark: earnings.nextPriorityBenchmark ?? null,
    unlockDelta: earnings.unlockDelta ?? null,
    potentialLoss: earnings.potentialLoss ?? null,
    currentPriorityLabel: raw.identity.currentPriority ?? undefined,
    nextPriorityLabel: raw.identity.nextPriority ?? undefined,
  };
}

function mapPerformance(raw: SaarthiRawData): SaarthiPerformance | null {
  const perf = raw.performance;
  if (!perf) return null;

  const metrics: SaarthiPerformanceMetric[] = [];

  if (perf.talkTime) {
    metrics.push({
      key: "talk_time",
      label: "Talk Time",
      today: perf.talkTime.today ?? null,
      yesterday: perf.talkTime.yesterday ?? null,
      average7d: perf.talkTime.sevenDayAvg ?? null,
      target: perf.talkTime.target ?? null,
      status: perf.talkTime.status ?? null,
      format: "seconds",
    });
  }

  if (perf.pickup) {
    metrics.push({
      key: "pickup",
      label: "Pickup Rate",
      today: perf.pickup.today ?? null,
      yesterday: perf.pickup.yesterday ?? null,
      average7d: perf.pickup.sevenDayAvg ?? null,
      target: perf.pickup.target ?? null,
      status: perf.pickup.status ?? null,
      format: "percent",
    });
  }

  if (perf.availability) {
    const avail = perf.availability;
    metrics.push({
      key: "availability",
      label: "Availability",
      today: avail.onlineTodayMin ?? null,
      yesterday: avail.onlineYesterdayMin ?? null,
      average7d: avail.onlineSevenDayAvgMin ?? null,
      target: avail.onlineTargetMin ?? null,
      status: avail.status ?? null,
      format: "minutes",
    });
  }

  if (perf.repeat) {
    metrics.push({
      key: "repeat",
      label: "Repeat Users",
      today: perf.repeat.today ?? null,
      yesterday: perf.repeat.yesterday ?? null,
      average7d: perf.repeat.sevenDayAvg ?? null,
      target: perf.repeat.target ?? null,
      status: perf.repeat.status ?? null,
      format: "number",
    });
  }

  if (perf.loyal) {
    metrics.push({
      key: "loyal",
      label: "Loyal Users",
      today: perf.loyal.today ?? null,
      yesterday: perf.loyal.yesterday ?? null,
      average7d: perf.loyal.sevenDayAvg ?? null,
      target: perf.loyal.target ?? null,
      status: perf.loyal.status ?? null,
      format: "number",
    });
  }

  if (!metrics.length) return null;

  return {
    featuredKey: "talk_time",
    metrics,
  };
}

function mapRanking(raw: SaarthiRawData): SaarthiRanking | null {
  const ranking = raw.ranking;
  if (!ranking) return null;
  return {
    currentRank: ranking.rank ?? null,
    yesterdayRank: ranking.yesterdayRank ?? null,
    cohortSize: ranking.cohortSize ?? null,
    movement: ranking.movement ?? null,
  };
}

function mapRiskLevel(level: string | null | undefined): string | null {
  if (!level) return null;
  const normalized = level.toLowerCase();
  if (normalized === "safe" || normalized === "protected") return "protected";
  if (normalized === "watch") return "watch";
  if (normalized === "critical" || normalized === "needs_attention") {
    return "needs_attention";
  }
  return normalized;
}

function mapRisk(raw: SaarthiRawData): SaarthiRisk | null {
  const risk = raw.risk;
  if (!risk) return null;
  return {
    state: mapRiskLevel(risk.level),
    title: risk.content?.title ?? undefined,
    message: risk.content?.body ?? undefined,
    reasonMetric: risk.reasonMetric ?? undefined,
    currentValue: risk.currentValue ?? null,
    safeValue: risk.safeValue ?? null,
    gap: risk.gap ?? null,
  };
}

function buildJourneySteps(
  currentPriority: string | null | undefined,
  nextPriority: string | null | undefined,
): SaarthiJourneyStep[] {
  if (!currentPriority) return [];
  const currentIndex = PRIORITY_LADDER.indexOf(currentPriority);
  if (currentIndex === -1) return [];
  return PRIORITY_LADDER.map((key) => ({
    key,
    label: key,
    isCurrent: key === currentPriority,
    isNext: key === nextPriority,
  }));
}

function mapJourney(raw: SaarthiRawData): SaarthiJourney | null {
  const journey = raw.journey;
  if (!journey) return null;

  const steps = buildJourneySteps(journey.currentPriority, journey.nextPriority);
  if (!steps.length) return null;

  return {
    steps,
    currentTtpu: secondsToDisplay(journey.currentValueSec),
    targetTtpu: secondsToDisplay(journey.targetValueSec),
    gap: secondsToDisplay(journey.gapSec),
    progressPercent: journey.progressPct ?? null,
    message: journey.content?.body ?? undefined,
  };
}

function mapContentBlock(content: SaarthiRawContent | null | undefined): SaarthiHighlight | null {
  if (!content?.body) return null;
  return {
    title: content.title ?? undefined,
    message: content.body ?? undefined,
  };
}

function mapMantra(content: SaarthiRawContent | null | undefined): SaarthiMantra | null {
  if (!content?.body) return null;
  return {
    title: content.title ?? undefined,
    message: content.body ?? undefined,
    ctaLabel: content.ctaLabel ?? undefined,
    ctaTarget: content.ctaTarget ?? undefined,
  };
}

function mapLayout(raw: SaarthiRawData): SaarthiLayoutItem[] {
  const layout = raw.layout ?? [];
  return layout
    .filter((item) => {
      const known = KNOWN_WIDGET_IDS.includes(item.id as SaarthiWidgetId);
      if (!known && import.meta.env.DEV) {
        console.warn(`[saarthiAdapter] Unknown widget id in layout: "${item.id}"`);
      }
      return known;
    })
    .map((item) => ({
      id: item.id,
      size: item.size,
      collapsed: item.collapsed,
    }));
}

/**
 * Converts the raw Apps Script "experience" payload (response.data) into the
 * SaarthiData shape the existing Saarthi widgets already expect.
 */
export function adaptSaarthiExperience(raw: SaarthiRawData): SaarthiData {
  return {
    schemaVersion: raw.schemaVersion,
    identity: mapIdentity(raw),
    hero: mapHero(raw),
    focus: mapFocus(raw),
    earnings: mapEarnings(raw),
    performance: mapPerformance(raw),
    ranking: mapRanking(raw),
    risk: mapRisk(raw),
    journey: mapJourney(raw),
    highlight: mapContentBlock(raw.highlight),
    mantra: mapMantra(raw.mantra),
    layout: mapLayout(raw),
    metadata: raw.metadata ?? undefined,
  };
}
