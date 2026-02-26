'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { getMissionsByTier } from '@/lib/missions';
import { SKILLS, SKILL_CATEGORIES, getSkillById } from '@/lib/skills';

interface ChildProfile {
  id: string;
  name: string;
  age: number;
  tier: 1 | 2 | 3;
  avatar: string;
}

interface MissionProgress {
  mission_id: string;
  completed: boolean;
  attempts: number;
  badge: string | null;
  xp_earned?: number;
  skill_practiced?: string;
}

interface ProgressResponse {
  records: MissionProgress[];
  totalXp: number;
  skills: Record<string, number>;
}

const TIER_LABELS = { 1: 'Explorer', 2: 'Adventurer', 3: 'Vibe Coder' };
const TIER_COLORS = {
  1: 'from-yellow-400 to-orange-500',
  2: 'from-blue-400 to-purple-500',
  3: 'from-green-400 to-cyan-500',
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000, 22000, 29000, 37000, 46000, 56000, 67000, 79000, 92000, 106000, 121000];
const LEVEL_NAMES = ['Rookie Builder', 'Curious Coder', 'App Maker', 'Logic Legend', 'Vibe Coder', 'AI Architect', 'Code Wizard', 'Debug Master', 'System Builder', 'AI Pioneer', 'Remix Pro', 'Spec Master', 'Pattern Pro', 'Prompt Engineer', 'Flow State', 'Deep Builder', 'AI Whisperer', 'Future Maker', 'Vibe Master', 'AI Legend'];

function getLevel(xp: number) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 20);
}

function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const percent = next === current ? 100 : Math.round(((xp - current) / (next - current)) * 100);
  return { level, levelName: LEVEL_NAMES[level - 1] ?? 'AI Legend', current: xp - current, needed: next - current, percent };
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded') === 'true';

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [progress, setProgress] = useState<MissionProgress[]>([]);
  const [totalXp, setTotalXp] = useState(0);
  const [skillCounts, setSkillCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/child-profiles')
      .then(r => r.json())
      .then(data => {
        setChildren(data);
        if (data.length === 0) {
          router.push('/onboarding');
        } else {
          setSelectedChild(data[0]);
        }
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (!selectedChild) return;
    fetch(`/api/progress?childId=${selectedChild.id}`)
      .then(r => r.json())
      .then((data: ProgressResponse) => {
        setProgress(data.records ?? []);
        setTotalXp(data.totalXp ?? 0);
        setSkillCounts(data.skills ?? {});
      });
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading your quests... 🚀</div>
      </div>
    );
  }

  const missions = selectedChild ? getMissionsByTier(selectedChild.tier) : [];
  const completedIds = new Set(progress.filter(p => p.completed).map(p => p.mission_id));
  const badges = progress.filter(p => p.badge).map(p => p.badge!);
  const levelInfo = getLevelProgress(totalXp);

  // Top 3 practiced skills for parent summary
  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => getSkillById(id as any))
    .filter(Boolean);

  const maxSkillCount = Math.max(...Object.values(skillCounts), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <span className="text-white font-bold text-xl">VibeQuest</span>
        </div>
        <div className="flex items-center gap-4">
          {totalXp > 0 && (
            <div className="text-purple-300 text-sm">
              <span className="text-white font-semibold">{levelInfo.levelName}</span>
              <span className="mx-2">·</span>
              <span>{totalXp} XP</span>
            </div>
          )}
          <Link href="/sandbox" className="text-purple-300 hover:text-white text-sm transition-colors">
            🎨 Sandbox
          </Link>
          <Link href="/gallery" className="text-purple-300 hover:text-white text-sm transition-colors">
            🖼️ Gallery
          </Link>
          <Link href="/pricing" className="text-purple-300 hover:text-white text-sm transition-colors">
            Upgrade Plan
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {upgraded && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-4 mb-6 text-center">
            <span className="text-green-300">🎉 Welcome to VibeQuest Pro! All missions are now unlocked.</span>
          </div>
        )}

        {/* Child selector */}
        <div className="flex items-center gap-4 mb-8">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                selectedChild?.id === child.id
                  ? 'bg-white/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="text-2xl">{child.avatar}</span>
              <div className="text-left">
                <div className="text-white font-semibold">{child.name}</div>
                <div className="text-purple-300 text-xs">{TIER_LABELS[child.tier]}</div>
              </div>
            </button>
          ))}
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-purple-300 hover:text-white transition-all"
          >
            <span className="text-xl">+</span>
            <span className="text-sm">Add child</span>
          </Link>
        </div>

        {selectedChild && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Missions Done', value: completedIds.size, emoji: '✅' },
                { label: 'Total Missions', value: missions.length, emoji: '🗺️' },
                { label: 'Badges Earned', value: badges.length, emoji: '🏅' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-5 text-center">
                  <div className="text-3xl mb-1">{emoji}</div>
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <div className="text-purple-300 text-sm">{label}</div>
                </div>
              ))}
            </div>

            {/* XP + Level bar */}
            {totalXp > 0 && (
              <div className="bg-white/10 rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-white font-bold">{levelInfo.levelName}</span>
                    <span className="text-purple-400 text-sm ml-2">Level {levelInfo.level}</span>
                  </div>
                  <span className="text-purple-300 text-sm">{totalXp} XP total</span>
                </div>
                <div className="bg-white/10 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${levelInfo.percent}%` }}
                  />
                </div>
                {levelInfo.level < 20 && (
                  <p className="text-purple-400 text-xs mt-2">{levelInfo.needed - levelInfo.current} XP to next level</p>
                )}
              </div>
            )}

            {/* Skills section */}
            {Object.keys(skillCounts).length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold text-xl mb-4">Skills Progress</h2>

                {/* Parent summary */}
                {topSkills.length > 0 && (
                  <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-5 mb-5">
                    <p className="text-blue-300 text-xs font-semibold mb-2">📚 What {selectedChild.name} is learning:</p>
                    <div className="space-y-2">
                      {topSkills.map(skill => skill && (
                        <div key={skill.id}>
                          <p className="text-white text-sm font-semibold">{skill.icon} {skill.name}</p>
                          <p className="text-blue-200 text-xs">{skill.parentExplanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill bars by category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SKILL_CATEGORIES.map(cat => {
                    const catSkills = SKILLS.filter(s => s.category === cat.id);
                    return (
                      <div key={cat.id} className="bg-white/5 rounded-2xl p-4">
                        <p className="text-purple-300 text-xs font-semibold mb-3">{cat.icon} {cat.label}</p>
                        <div className="space-y-2">
                          {catSkills.map(skill => {
                            const count = skillCounts[skill.id] ?? 0;
                            const pct = Math.round((count / maxSkillCount) * 100);
                            return (
                              <div key={skill.id}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-white">{skill.icon} {skill.name}</span>
                                  <span className="text-purple-400">{count > 0 ? `${count}×` : '—'}</span>
                                </div>
                                <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-400 rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="mb-8">
                <h2 className="text-white font-semibold mb-3">Badges Earned</h2>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, i) => (
                    <span key={i} className="bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm px-3 py-1 rounded-full">
                      🏅 {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sandbox card */}
            <div className="mb-6">
              <Link
                href={`/sandbox?childId=${selectedChild.id}`}
                className="flex items-center gap-4 bg-gradient-to-r from-purple-600/30 to-blue-600/30 border border-purple-400/30 rounded-2xl p-5 hover:from-purple-600/40 hover:to-blue-600/40 transition-all"
              >
                <span className="text-4xl">🎨</span>
                <div>
                  <p className="text-white font-bold">Open Sandbox</p>
                  <p className="text-purple-300 text-sm">Build anything — no mission, no rules, pure creation</p>
                </div>
                <span className="ml-auto text-purple-400">→</span>
              </Link>
            </div>

            {/* Mission grid */}
            <h2 className="text-white font-semibold text-xl mb-4">
              {selectedChild.name}&apos;s Missions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {missions.map((mission) => {
                const isCompleted = completedIds.has(mission.id);
                const missionProgress = progress.find(p => p.mission_id === mission.id);
                const isLocked = false;

                return (
                  <div
                    key={mission.id}
                    className={`relative rounded-2xl p-5 transition-all ${
                      isLocked
                        ? 'bg-white/5 opacity-60'
                        : isCompleted
                        ? 'bg-green-500/20 border border-green-400/30'
                        : 'bg-white/10 hover:bg-white/15 cursor-pointer'
                    }`}
                    onClick={() => !isLocked && router.push(`/play/${selectedChild.tier}/${mission.id}?childId=${selectedChild.id}`)}
                  >
                    {isCompleted && (
                      <div className="absolute top-3 right-3 text-green-400 text-xl">✅</div>
                    )}
                    {isLocked && (
                      <div className="absolute top-3 right-3 text-white/40 text-xl">🔒</div>
                    )}

                    <div className={`inline-block text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${TIER_COLORS[selectedChild.tier]} text-white mb-3`}>
                      {mission.difficulty}
                    </div>
                    <h3 className="text-white font-bold mb-1">{mission.title}</h3>
                    <p className="text-purple-300 text-sm line-clamp-2">{mission.story}</p>

                    {mission.primarySkill && (
                      <p className="text-purple-500 text-xs mt-2">
                        {getSkillById(mission.primarySkill)?.icon} {getSkillById(mission.primarySkill)?.name}
                        {mission.xp && <span className="ml-2 text-yellow-500">+{mission.xp} XP</span>}
                      </p>
                    )}

                    {missionProgress && !isCompleted && (
                      <p className="text-purple-400 text-xs mt-1">
                        {missionProgress.attempts} attempt{missionProgress.attempts !== 1 ? 's' : ''} so far
                      </p>
                    )}

                    {isLocked && (
                      <Link
                        href="/pricing"
                        onClick={e => e.stopPropagation()}
                        className="mt-3 inline-block text-xs text-yellow-400 hover:underline"
                      >
                        Unlock with Pro →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
