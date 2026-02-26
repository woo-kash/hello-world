export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000,
  22000, 29000, 37000, 46000, 56000, 67000, 79000, 92000, 106000, 121000,
];

export const LEVEL_NAMES = [
  'Rookie Builder', 'Curious Coder', 'App Maker', 'Logic Legend', 'Vibe Coder',
  'AI Architect', 'Code Wizard', 'Debug Master', 'System Builder', 'AI Pioneer',
  'Remix Pro', 'Spec Master', 'Pattern Pro', 'Prompt Engineer', 'Flow State',
  'Deep Builder', 'AI Whisperer', 'Future Maker', 'Vibe Master', 'AI Legend',
];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)] ?? 'AI Legend';
}

export function getNextLevelXP(level: number): number {
  return LEVEL_THRESHOLDS[Math.min(level, LEVEL_THRESHOLDS.length - 1)] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
}

export function getStreakBonus(streakDays: number): number {
  if (streakDays >= 10) return 1.5;
  if (streakDays >= 5) return 1.25;
  if (streakDays >= 2) return 1.1;
  return 1.0;
}

export function getLevelProgress(xp: number): { level: number; levelName: string; current: number; needed: number; percent: number } {
  const level = getLevel(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const range = nextThreshold - currentThreshold;
  const progress = xp - currentThreshold;
  const percent = range === 0 ? 100 : Math.round((progress / range) * 100);
  return {
    level,
    levelName: getLevelName(level),
    current: progress,
    needed: range,
    percent: Math.min(percent, 100),
  };
}
