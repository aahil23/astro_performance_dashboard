import type {
  SaarthiCoachingAction,
  SaarthiFocusItem,
} from "@/types/saarthi";

const IST_TIME_ZONE = "Asia/Kolkata";
const DEFAULT_ACTION_COUNT = 3;

export function selectDailyCoachingActions(
  expertId: string | number,
  item: SaarthiFocusItem,
  count = DEFAULT_ACTION_COUNT,
  now = new Date(),
): SaarthiCoachingAction[] {
  const actions = normalizeActions(item.coaching?.actions ?? []);

  if (actions.length <= count) {
    return actions;
  }

  const metricKey =
    item.coaching?.metricKey ||
    item.type ||
    item.id ||
    "general";

  const seed = [
    String(expertId),
    String(metricKey),
    getIstDateKey(now),
  ].join("|");

  return deterministicShuffle(actions, seed).slice(0, count);
}

export function hasCoachingActions(item?: SaarthiFocusItem | null): boolean {
  return normalizeActions(item?.coaching?.actions ?? []).length > 0;
}

export function getIstDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeActions(
  actions: SaarthiCoachingAction[],
): SaarthiCoachingAction[] {
  const seen = new Set<string>();

  return actions
    .filter((action) => action && action.id && action.text)
    .filter((action) => {
      if (seen.has(action.id)) {
        return false;
      }

      seen.add(action.id);
      return true;
    });
}

function deterministicShuffle<T>(items: T[], seedText: string): T[] {
  const output = [...items];
  const random = mulberry32(hashString(seedText));

  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [output[index], output[swapIndex]] = [
      output[swapIndex],
      output[index],
    ];
  }

  return output;
}

function hashString(value: string): number {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
