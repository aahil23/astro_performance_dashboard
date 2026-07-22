export interface SaarthiIdentity {
  expertId: number | string;
  expertName: string;
  primaryLanguage?: string;
  currentPriority?: string;
  nextPriority?: string;
  variant?: string;
}

export interface SaarthiHero {
  greeting?: string;
  priorityLabel?: string;
  message?: string;
  motivation?: string;
  progressPercent?: number | null;
  currentAtt?: string | number | null;
  targetAtt?: string | number | null;
  gap?: string | number | null;
  [key: string]: unknown;
}

export interface SaarthiCoachingAction {
  id: string;
  category?: string;
  text: string;
}

export interface SaarthiCoaching {
  metricKey: string;
  actions: SaarthiCoachingAction[];
}

export interface SaarthiFocusItem {
  id?: string;
  type?: string;
  title?: string;
  body?: string;
  currentValue?: string | number | null;
  comparisonValue?: string | number | null;
  targetValue?: string | number | null;
  status?: string | null;
  ctaLabel?: string;
  ctaTarget?: string;
  coaching?: SaarthiCoaching | null;
  [key: string]: unknown;
}

export interface SaarthiFocus {
  primary?: SaarthiFocusItem | null;
  secondary?: SaarthiFocusItem[] | null;
  [key: string]: unknown;
}

export interface SaarthiEarnings {
  today?: number | null;
  yesterday?: number | null;
  average7d?: number | null;
  currentBenchmark?: number | null;
  effectiveBenchmark?: number | null;
  benchmarkStatus?: string | null;
  nextBenchmark?: number | null;
  unlockDelta?: number | null;
  potentialLoss?: number | null;
  currentPriorityLabel?: string;
  nextPriorityLabel?: string;
  [key: string]: unknown;
}

export interface SaarthiPerformanceMetric {
  key: string;
  label?: string;
  today?: number | string | null;
  yesterday?: number | string | null;
  average7d?: number | string | null;
  target?: number | string | null;
  status?: string | null;
  unit?: string;
  format?: "seconds" | "minutes" | "percent" | "count" | "number" | "inr";
  displayMode?: "count" | "percent";
  [key: string]: unknown;
}

export interface SaarthiPerformance {
  featuredKey?: string;
  metrics?: SaarthiPerformanceMetric[] | null;
  [key: string]: unknown;
}

export interface SaarthiRanking {
  currentRank?: number | null;
  yesterdayRank?: number | null;
  cohortSize?: number | null;
  movement?: number | null;
  [key: string]: unknown;
}

export type SaarthiRiskState = "protected" | "watch" | "needs_attention";

export interface SaarthiRisk {
  state?: SaarthiRiskState | string | null;
  title?: string;
  message?: string;
  reasonMetric?: string;
  currentValue?: string | number | null;
  safeValue?: string | number | null;
  gap?: string | number | null;
  [key: string]: unknown;
}

export interface SaarthiJourneyStep {
  key: string;
  label?: string;
  isCurrent?: boolean;
  isNext?: boolean;
}

export interface SaarthiJourney {
  steps?: SaarthiJourneyStep[] | null;
  currentTtpu?: string | number | null;
  targetTtpu?: string | number | null;
  gap?: string | number | null;
  progressPercent?: number | null;
  message?: string;
  [key: string]: unknown;
}

export interface SaarthiHighlight {
  title?: string;
  message?: string;
  [key: string]: unknown;
}

export interface SaarthiMantra {
  title?: string;
  message?: string;
  ctaLabel?: string;
  ctaTarget?: string;
  [key: string]: unknown;
}

export type SaarthiWidgetSize = "large" | "medium" | "small";

export type SaarthiWidgetId =
  | "focus"
  | "earnings"
  | "performance"
  | "highlight"
  | "mantra"
  | "priority_journey"
  | "leaderboard"
  | "risk_meter";

export interface SaarthiLayoutItem {
  id: SaarthiWidgetId | string;
  size?: SaarthiWidgetSize;
  collapsed?: boolean;
}

export interface SaarthiData {
  schemaVersion?: string;
  identity: SaarthiIdentity;
  hero?: SaarthiHero | null;
  focus?: SaarthiFocus | null;
  earnings?: SaarthiEarnings | null;
  performance?: SaarthiPerformance | null;
  ranking?: SaarthiRanking | null;
  risk?: SaarthiRisk | null;
  journey?: SaarthiJourney | null;
  highlight?: SaarthiHighlight | null;
  mantra?: SaarthiMantra | null;
  layout?: SaarthiLayoutItem[];
  metadata?: Record<string, unknown>;
}

export interface SaarthiResponse {
  statusCode: number;
  success: boolean;
  data: SaarthiData;
  message?: string;
}

/* -------------------------------------------------------------------------
 * Raw backend contract (Apps Script "experience" endpoint).
 * ---------------------------------------------------------------------- */

export interface SaarthiRawIdentity {
  expertId: number | string;
  expertName: string;
  primaryLanguage?: string | null;
  currentPriority?: string | null;
  nextPriority?: string | null;
  variant?: string | null;
}

export interface SaarthiRawHero {
  greeting?: string | null;
  priority?: string | null;
  nextPriority?: string | null;
  message?: string | null;
  motivation?: string | null;
  progressPct?: number | null;
  currentTtpuSec?: number | null;
  targetTtpuSec?: number | null;
  gapSec?: number | null;
  gapDisplay?: string | null;
  currentDisplay?: string | null;
  targetDisplay?: string | null;
}

export interface SaarthiRawCoachingAction {
  id?: string | null;
  category?: string | null;
  text?: string | null;
}

export interface SaarthiRawCoaching {
  metricKey?: string | null;
  actions?: SaarthiRawCoachingAction[] | null;
}

export interface SaarthiRawFocusItem {
  type?: string | null;
  score?: number | null;
  status?: string | null;
  currentValue?: number | string | null;
  comparisonValue?: number | string | null;
  targetValue?: number | string | null;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaTarget?: string | null;
  coaching?: SaarthiRawCoaching | null;
}

export interface SaarthiRawFocus {
  primary?: SaarthiRawFocusItem | null;
  secondary?: SaarthiRawFocusItem[] | null;
}

export interface SaarthiRawEarnings {
  today?: number | null;
  yesterday?: number | null;
  sevenDayAvg?: number | null;
  currentPriorityBenchmark?: number | null;
  effectiveBenchmark?: number | null;
  benchmarkStatus?: string | null;
  nextPriorityBenchmark?: number | null;
  lowerPriorityBenchmark?: number | null;
  todayVsYesterday?: number | null;
  todayVsSevenDayAvg?: number | null;
  unlockDelta?: number | null;
  potentialLoss?: number | null;
}

export interface SaarthiRawMetricBlock {
  today?: number | null;
  yesterday?: number | null;
  sevenDayAvg?: number | null;
  target?: number | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface SaarthiRawPerformance {
  talkTime?: SaarthiRawMetricBlock | null;
  pickup?: SaarthiRawMetricBlock | null;
  availability?:
    | (SaarthiRawMetricBlock & {
        onlineTodayMin?: number | null;
        onlineYesterdayMin?: number | null;
        onlineSevenDayAvgMin?: number | null;
        onlineTargetMin?: number | null;
        utilisationTodayPct?: number | null;
      })
    | null;
  repeat?:
    | (SaarthiRawMetricBlock & {
        displayMode?: "count" | "percent" | null;
        eligibleUsersToday?: number | null;
        eligibleUsersYesterday?: number | null;
        eligibleUsersSevenDay?: number | null;
      })
    | null;
  loyal?: SaarthiRawMetricBlock | null;
  ratings?: {
    today?: number | null;
    yesterday?: number | null;
    sevenDayAvg?: number | null;
    comparison?: number | null;
    countToday?: number | null;
    countYesterday?: number | null;
    countSevenDay?: number | null;
    status?: string | null;
  } | null;
}

export interface SaarthiRawRanking {
  rank?: number | null;
  cohortSize?: number | null;
  yesterdayRank?: number | null;
  movement?: number | null;
}

export interface SaarthiRawContent {
  contentId?: string | null;
  title?: string | null;
  body?: string | null;
  ctaLabel?: string | null;
  ctaTarget?: string | null;
}

export interface SaarthiRawRisk {
  level?: string | null;
  reasonMetric?: string | null;
  currentValue?: number | string | null;
  safeValue?: number | string | null;
  gap?: number | string | null;
  content?: SaarthiRawContent | null;
}

export interface SaarthiRawJourney {
  currentPriority?: string | null;
  nextPriority?: string | null;
  currentValueSec?: number | null;
  targetValueSec?: number | null;
  gapSec?: number | null;
  progressPct?: number | null;
  content?: SaarthiRawContent | null;
}

export interface SaarthiRawLayoutItem {
  id: string;
  size?: SaarthiWidgetSize;
  collapsed?: boolean;
}

export interface SaarthiRawData {
  schemaVersion?: string;
  identity: SaarthiRawIdentity;
  hero?: SaarthiRawHero | null;
  focus?: SaarthiRawFocus | null;
  earnings?: SaarthiRawEarnings | null;
  performance?: SaarthiRawPerformance | null;
  ranking?: SaarthiRawRanking | null;
  risk?: SaarthiRawRisk | null;
  journey?: SaarthiRawJourney | null;
  highlight?: SaarthiRawContent | null;
  mantra?: SaarthiRawContent | null;
  layout?: SaarthiRawLayoutItem[] | null;
  metadata?: Record<string, unknown> | null;
}

export interface SaarthiRawEnvelope {
  statusCode: number;
  success: boolean;
  data: SaarthiRawData;
  message?: string;
}
