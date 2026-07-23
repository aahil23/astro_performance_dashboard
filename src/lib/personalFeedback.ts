export function personalFeedbackSeenKey(expertId: string | number): string {
  return `saarthi_feedback_seen_${String(expertId)}`;
}

export function getLastSeenFeedbackVersion(expertId: string | number): number {
  if (typeof window === "undefined") return 0;
  try {
    const value = localStorage.getItem(personalFeedbackSeenKey(expertId));
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}

export function isPersonalFeedbackNew(expertId: string | number, version: number): boolean {
  return version > getLastSeenFeedbackVersion(expertId);
}

export function markPersonalFeedbackSeen(expertId: string | number, version: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(personalFeedbackSeenKey(expertId), String(version));
  } catch {
    // Ignore storage failure.
  }
}
