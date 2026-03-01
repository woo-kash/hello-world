/**
 * Season calendar — shared unlock schedule for all kids.
 * One challenge unlocks every 2 days. All kids on the same schedule.
 * Season runs 29 days (15 challenges per tier).
 */

export const CURRENT_SEASON = {
  name: 'Spring 2026',
  emoji: '🌱',
  startDate: new Date('2026-03-01T00:00:00Z'),
};

/** Day 1 = first day of season. Returns 1 on or before start date. */
export function getSeasonDayToday(): number {
  const ms = Date.now() - CURRENT_SEASON.startDate.getTime();
  if (ms < 0) return 1;
  return Math.floor(ms / 86400000) + 1;
}

/** Returns the calendar date when a given season day unlocks. */
export function getMissionUnlockDate(seasonDay: number): Date {
  const d = new Date(CURRENT_SEASON.startDate);
  d.setDate(d.getDate() + seasonDay - 1);
  return d;
}

/** Returns true if the mission's season day has been reached. */
export function isMissionUnlocked(seasonDay: number): boolean {
  return getSeasonDayToday() >= seasonDay;
}

/** Returns how many days until a mission unlocks (0 if already unlocked). */
export function daysUntilUnlock(seasonDay: number): number {
  return Math.max(0, seasonDay - getSeasonDayToday());
}

/** Format unlock date as a readable string, e.g. "Mar 5" */
export function formatUnlockDate(seasonDay: number): string {
  const d = getMissionUnlockDate(seasonDay);
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}
