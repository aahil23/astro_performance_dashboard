import type {
  SaarthiCoaching,
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
  SaarthiPersonalFeedback,
  SaarthiRanking,
  SaarthiRawCoaching,
  SaarthiRawContent,
  SaarthiRawData,
  SaarthiRawFocusItem,
  SaarthiRisk,
  SaarthiWidgetId,
} from "@/types/saarthi";

const KNOWN_WIDGET_IDS: SaarthiWidgetId[] = [
  "focus",
  "personal_feedback",
  "earnings",
  "performance",
  "highlight",
  "mantra",
  "priority_journey",
  "leaderboard",
  "risk_meter",
];

const PRIORITY_LADDER = ["P5", "P4", "P3", "P2", "P1"];

function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function secondsToDisplay(value: number | null | undefined): string | null {
  if (isNil(value) || Number.isNaN(Number(value))) return null;
  const numericValue = Number(value);
  const minutes = Math.floor(numericValue / 60);
  const seconds = Math.round(numericValue % 60);
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
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
    currentAtt: hero.currentDisplay ?? secondsToDisplay(hero.currentTtpuSec),
    targetAtt: hero.targetDisplay ?? secondsToDisplay(hero.targetTtpuSec),
    gap: hero.gapDisplay ?? secondsToDisplay(hero.gapSec),
  };
}

function mapCoaching(coaching?: SaarthiRawCoaching | null): SaarthiCoaching | null {
  if (!coaching?.metricKey) return null;
  const actions = (coaching.actions ?? [])
    .filter((action) => Boolean(action?.id) && Boolean(action?.text))
    .map((action) => ({
      id: String(action.id),
      category: action.category ?? undefined,
      text: String(action.text),
    }));
  return actions.length ? { metricKey: coaching.metricKey, actions } : null;
}

function mapFocusItem(item: SaarthiRawFocusItem | null | undefined): SaarthiFocusItem | null {
  if (!item) return null;
  return {
    id: item.type ?? undefined,
    type: item.type ?? undefined,
    title: item.title ?? undefined,
    body: item.body ?? undefined,
    currentValue: item.currentValue ?? null,
    comparisonValue: item.comparisonValue ?? null,
    targetValue: item.targetValue ?? null,
    status: item.status ?? null,
    ctaLabel: item.ctaLabel ?? undefined,
    ctaTarget: item.ctaTarget ?? undefined,
    coaching: mapCoaching(item.coaching),
  };
}

function mapFocus(raw: SaarthiRawData): SaarthiFocus | null {
  const focus = raw.focus;
  if (!focus) return null;
  return {
    primary: mapFocusItem(focus.primary),
    secondary: (focus.secondary ?? [])
      .map(mapFocusItem)
      .filter((item): item is SaarthiFocusItem => item !== null),
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
    effectiveBenchmark: earnings.effectiveBenchmark ?? null,
    benchmarkStatus: earnings.benchmarkStatus ?? null,
    nextBenchmark: earnings.nextPriorityBenchmark ?? null,
    unlockDelta: earnings.unlockDelta ?? null,
    potentialLoss: earnings.potentialLoss ?? null,
    currentPriorityLabel: raw.identity.currentPriority ?? undefined,
    nextPriorityLabel: raw.identity.nextPriority ?? undefined,
  };
}

function mapPerformance(raw: SaarthiRawData): SaarthiPerformance | null {
  const performance = raw.performance;
  if (!performance) return null;
  const metrics: SaarthiPerformanceMetric[] = [];

  if (performance.talkTime) {
    metrics.push({ key: "talk_time", label: "Talk Time", today: performance.talkTime.today ?? null, yesterday: performance.talkTime.yesterday ?? null, average7d: performance.talkTime.sevenDayAvg ?? null, target: performance.talkTime.target ?? null, status: performance.talkTime.status ?? null, format: "seconds" });
  }
  if (performance.pickup) {
    metrics.push({ key: "pickup", label: "Pickup Rate", today: performance.pickup.today ?? null, yesterday: performance.pickup.yesterday ?? null, average7d: performance.pickup.sevenDayAvg ?? null, target: performance.pickup.target ?? null, status: performance.pickup.status ?? null, format: "percent" });
  }
  if (performance.availability) {
    metrics.push({ key: "availability", label: "Online Time", today: performance.availability.onlineTodayMin ?? null, yesterday: performance.availability.onlineYesterdayMin ?? null, average7d: performance.availability.onlineSevenDayAvgMin ?? null, target: performance.availability.onlineTargetMin ?? null, status: performance.availability.status ?? null, format: "minutes" });
  }
  if (performance.repeat) {
    const displayMode = performance.repeat.displayMode === "percent" ? "percent" : "count";
    metrics.push({ key: "repeat", label: "Repeat Users", today: performance.repeat.today ?? null, yesterday: performance.repeat.yesterday ?? null, average7d: performance.repeat.sevenDayAvg ?? null, status: performance.repeat.status ?? null, format: displayMode, displayMode, eligibleUsersToday: performance.repeat.eligibleUsersToday ?? null });
  }
  if (performance.loyal) {
    metrics.push({ key: "loyal", label: "Loyal Users", today: performance.loyal.today ?? null, yesterday: performance.loyal.yesterday ?? null, average7d: performance.loyal.sevenDayAvg ?? null, status: performance.loyal.status ?? null, format: "percent" });
  }
  if (performance.ratings) {
    metrics.push({ key: "rating", label: "Rating", today: performance.ratings.today ?? null, yesterday: performance.ratings.yesterday ?? null, average7d: performance.ratings.sevenDayAvg ?? null, status: performance.ratings.status ?? null, format: "number", count: performance.ratings.countToday ?? null });
  }

  return { featuredKey: raw.focus?.primary?.type ?? undefined, metrics };
}

function mapRanking(raw: SaarthiRawData): SaarthiRanking | null {
  const ranking = raw.ranking;
  if (!ranking) return null;
  return { currentRank: ranking.rank ?? null, yesterdayRank: ranking.yesterdayRank ?? null, cohortSize: ranking.cohortSize ?? null, movement: ranking.movement ?? null };
}

function mapContentBlock(raw?: SaarthiRawContent | null): SaarthiHighlight | null {
  if (!raw) return null;
  return { title: raw.title ?? undefined, message: raw.body ?? undefined };
}

function mapMantra(raw?: SaarthiRawContent | null): SaarthiMantra | null {
  if (!raw) return null;
  return { title: raw.title ?? undefined, message: raw.body ?? undefined, ctaLabel: raw.ctaLabel ?? undefined, ctaTarget: raw.ctaTarget ?? undefined };
}

function mapPersonalFeedback(raw: SaarthiRawData): SaarthiPersonalFeedback | null {
  const feedback = raw.personalFeedback;
  if (!feedback?.id || !feedback.title || !feedback.text || !feedback.version) return null;
  return {
    id: feedback.id,
    title: feedback.title,
    text: feedback.text,
    markdown: feedback.markdown ?? feedback.text,
    version: feedback.version,
  };
}

function mapRisk(raw: SaarthiRawData): SaarthiRisk | null {
  const risk = raw.risk;
  if (!risk) return null;
  return { state: risk.level ?? null, title: risk.content?.title ?? undefined, message: risk.content?.body ?? undefined, reasonMetric: risk.reasonMetric ?? undefined, currentValue: risk.currentValue ?? null, safeValue: risk.safeValue ?? null, gap: risk.gap ?? null };
}

function mapJourney(raw: SaarthiRawData): SaarthiJourney | null {
  const journey = raw.journey;
  if (!journey) return null;
  const currentPriority = journey.currentPriority ?? "";
  const nextPriority = journey.nextPriority ?? "";
  const steps: SaarthiJourneyStep[] = PRIORITY_LADDER.map((priority) => ({ key: priority, label: priority, isCurrent: priority === currentPriority, isNext: priority === nextPriority }));
  return { steps, currentTtpu: secondsToDisplay(journey.currentValueSec), targetTtpu: secondsToDisplay(journey.targetValueSec), gap: secondsToDisplay(journey.gapSec), progressPercent: journey.progressPct ?? null, message: journey.content?.body ?? undefined };
}

function mapLayout(raw: SaarthiRawData): SaarthiLayoutItem[] {
  return (raw.layout ?? [])
    .filter((item) => {
      const known = KNOWN_WIDGET_IDS.includes(item.id as SaarthiWidgetId);
      if (!known && import.meta.env.DEV) console.warn(`[saarthiAdapter] Unknown widget id in layout: "${item.id}"`);
      return known;
    })
    .map((item) => ({ id: item.id, size: item.size, collapsed: item.collapsed }));
}

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
    personalFeedback: mapPersonalFeedback(raw),
    layout: mapLayout(raw),
    metadata: raw.metadata ?? undefined,
  };
}
