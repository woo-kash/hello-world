'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { getMissionsByTier } from '@/lib/missions';
import { SKILLS, SKILL_CATEGORIES, getSkillById } from '@/lib/skills';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

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

// ─── Edit Child Modal ───────────────────────────────────────────────
interface EditModalProps {
  child: ChildProfile;
  onSave: (updated: { name: string; age: number; tier: 1 | 2 | 3 }) => void;
  onClose: () => void;
}

function EditChildModal({ child, onSave, onClose }: EditModalProps) {
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(String(child.age));
  const [saving, setSaving] = useState(false);

  const tier = (parseInt(age) <= 8 ? 1 : parseInt(age) <= 12 ? 2 : 3) as 1 | 2 | 3;
  const tierLabel = tier === 1 ? 'Explorer (6–8)' : tier === 2 ? 'Adventurer (9–12)' : 'Vibe Coder (13–16)';

  async function handleSave() {
    if (!name || !age) return;
    setSaving(true);
    await fetch('/api/child-profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: child.id, name, age: parseInt(age), tier }),
    });
    setSaving(false);
    onSave({ name, age: parseInt(age), tier });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(13,61,48,0.4)' }}>
      <div className="w-full max-w-sm rounded-3xl p-6 space-y-4" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
        <h3 className="font-bold text-lg" style={{ color: 'var(--vq-text)' }}>Edit Profile</h3>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--vq-muted)' }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--vq-primary)]"
            style={{ border: '1px solid var(--vq-border)', background: 'var(--vq-bg)', color: 'var(--vq-text)' }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: 'var(--vq-muted)' }}>Age</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            min="4"
            max="17"
            className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--vq-primary)]"
            style={{ border: '1px solid var(--vq-border)', background: 'var(--vq-bg)', color: 'var(--vq-text)' }}
          />
          {age && (
            <p className="text-xs mt-1" style={{ color: 'var(--vq-primary)' }}>Tier: {tierLabel}</p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-colors disabled:opacity-50"
            style={{ background: 'var(--vq-primary)' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors"
            style={{ border: '1px solid var(--vq-border)', color: 'var(--vq-muted)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
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
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--vq-bg)' }}>
        <div className="text-2xl animate-pulse font-bold" style={{ color: 'var(--vq-primary)' }}>Loading your quests… ✨</div>
      </div>
    );
  }

  const missions = selectedChild ? getMissionsByTier(selectedChild.tier) : [];
  const completedIds = new Set(progress.filter(p => p.completed).map(p => p.mission_id));
  const badges = progress.filter(p => p.badge).map(p => p.badge!);
  const levelInfo = getLevelProgress(totalXp);

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => getSkillById(id as any))
    .filter(Boolean);

  const maxSkillCount = Math.max(...Object.values(skillCounts), 1);

  function missionBorderClass(type?: string) {
    if (type === 'game-builder') return 'mission-border-game';
    if (type === 'debug') return 'mission-border-debug';
    if (type === 'remix') return 'mission-border-remix';
    if (type === 'spec') return 'mission-border-spec';
    if (type === 'judge') return 'mission-border-judge';
    if (type === 'music') return 'mission-border-music';
    return 'mission-border-default';
  }

  function handleEditSave(childId: string, updated: { name: string; age: number; tier: 1 | 2 | 3 }) {
    setChildren(prev => prev.map(c => c.id === childId ? { ...c, ...updated } : c));
    if (selectedChild?.id === childId) {
      setSelectedChild(prev => prev ? { ...prev, ...updated } : prev);
    }
    setEditingChild(null);
  }

  return (
    <div className="min-h-screen vq-stars-bg" style={{ background: 'var(--vq-bg)' }}>
      {editingChild && (
        <EditChildModal
          child={editingChild}
          onSave={u => handleEditSave(editingChild.id, u)}
          onClose={() => setEditingChild(null)}
        />
      )}

      {/* Header */}
      <header className="border-b border-[var(--vq-border)] px-6 py-4 flex items-center justify-between" style={{ background: 'var(--vq-surface)' }}>
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" width={28} height={28} alt="" />
          <span className="font-bold text-xl" style={{ color: 'var(--vq-text)' }}>VibeQuest</span>
        </div>
        <div className="flex items-center gap-4">
          {totalXp > 0 && (
            <div className="text-sm" style={{ color: 'var(--vq-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--vq-text)' }}>{levelInfo.levelName}</span>
              <span className="mx-2">·</span>
              <span>{totalXp} XP</span>
            </div>
          )}
          <Link href="/sandbox" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-muted)' }}>
            🎨 Sandbox
          </Link>
          <Link href="/gallery" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-muted)' }}>
            🖼️ Gallery
          </Link>
          <Link href="/pricing" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-muted)' }}>
            Upgrade Plan
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {upgraded && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 text-center">
            <span className="text-green-700">🎉 Welcome to VibeQuest Pro! All missions are now unlocked.</span>
          </div>
        )}

        {/* Child selector */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          {children.map(child => (
            <div key={child.id} className="flex items-center gap-2">
              <button
                onClick={() => setSelectedChild(child)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all border ${
                  selectedChild?.id === child.id
                    ? 'border-[var(--vq-primary)] shadow-sm'
                    : 'hover:border-[var(--vq-primary)]/50'
                }`}
                style={{
                  background: selectedChild?.id === child.id ? 'rgba(31,179,143,0.08)' : 'var(--vq-card)',
                  borderColor: selectedChild?.id === child.id ? 'var(--vq-primary)' : 'var(--vq-border)',
                }}
              >
                <AvatarDisplay avatar={child.avatar} size={28} />
                <div className="text-left">
                  <div className="font-semibold text-sm" style={{ color: 'var(--vq-text)' }}>{child.name}</div>
                  <div className="text-xs" style={{ color: 'var(--vq-muted)' }}>{TIER_LABELS[child.tier]}</div>
                </div>
              </button>
              <button
                onClick={() => setEditingChild(child)}
                className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-[var(--vq-border)]"
                style={{ color: 'var(--vq-muted)' }}
                title="Edit profile"
              >
                ✏️
              </button>
            </div>
          ))}
          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all border text-sm"
            style={{ border: '1px solid var(--vq-border)', color: 'var(--vq-muted)', background: 'var(--vq-card)' }}
          >
            <span>+</span>
            <span>Add child</span>
          </Link>
        </div>

        {selectedChild && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Missions Done', value: completedIds.size, emoji: '✅', accent: 'var(--vq-primary)' },
                { label: 'Total Missions', value: missions.length, emoji: '🗺️', accent: 'var(--vq-purple)' },
                { label: 'Badges Earned', value: badges.length, emoji: '🏅', accent: 'var(--vq-accent-3)' },
              ].map(({ label, value, emoji, accent }) => (
                <div key={label} className="rounded-3xl p-5 text-center" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
                  <div className="text-3xl mb-1">{emoji}</div>
                  <div className="text-3xl font-extrabold" style={{ color: accent }}>{value}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--vq-muted)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* XP + Level bar */}
            {totalXp > 0 && (
              <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{levelInfo.levelName}</span>
                    <span className="text-sm ml-2" style={{ color: 'var(--vq-muted)' }}>Level {levelInfo.level}</span>
                  </div>
                  <span className="text-sm" style={{ color: 'var(--vq-muted)' }}>{totalXp} XP total</span>
                </div>
                <div className="rounded-full h-3" style={{ background: 'var(--vq-border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${levelInfo.percent}%`, background: 'linear-gradient(to right, var(--vq-primary), var(--vq-purple))' }}
                  />
                </div>
                {levelInfo.level < 20 && (
                  <p className="text-xs mt-2" style={{ color: 'var(--vq-muted)' }}>{levelInfo.needed - levelInfo.current} XP to next level</p>
                )}
              </div>
            )}

            {/* Skills section */}
            {Object.keys(skillCounts).length > 0 && (
              <div className="mb-8">
                <h2 className="font-semibold text-xl mb-4" style={{ color: 'var(--vq-text)' }}>Skills Progress</h2>

                {topSkills.length > 0 && (
                  <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(31,179,143,0.06)', border: '1px solid rgba(31,179,143,0.2)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--vq-primary)' }}>📚 What {selectedChild.name} is learning:</p>
                    <div className="space-y-2">
                      {topSkills.map(skill => skill && (
                        <div key={skill.id}>
                          <p className="text-sm font-semibold" style={{ color: 'var(--vq-text)' }}>{skill.icon} {skill.name}</p>
                          <p className="text-xs" style={{ color: 'var(--vq-muted)' }}>{skill.parentExplanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SKILL_CATEGORIES.map(cat => {
                    const catSkills = SKILLS.filter(s => s.category === cat.id);
                    return (
                      <div key={cat.id} className="rounded-2xl p-4" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
                        <p className="text-xs font-semibold mb-3" style={{ color: 'var(--vq-muted)' }}>{cat.icon} {cat.label}</p>
                        <div className="space-y-2">
                          {catSkills.map(skill => {
                            const count = skillCounts[skill.id] ?? 0;
                            const pct = Math.round((count / maxSkillCount) * 100);
                            return (
                              <div key={skill.id}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span style={{ color: 'var(--vq-text)' }}>{skill.icon} {skill.name}</span>
                                  <span style={{ color: 'var(--vq-muted)' }}>{count > 0 ? `${count}×` : '—'}</span>
                                </div>
                                <div className="rounded-full h-1.5" style={{ background: 'var(--vq-border)' }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, background: 'linear-gradient(to right, var(--vq-primary), var(--vq-purple))' }}
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
                <h2 className="font-semibold mb-3" style={{ color: 'var(--vq-text)' }}>Badges Earned</h2>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge, i) => (
                    <span key={i} className="text-sm px-3 py-1 rounded-full" style={{ background: 'rgba(255,209,102,0.15)', border: '1px solid rgba(255,209,102,0.4)', color: '#A0780A' }}>
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
                className="flex items-center gap-4 rounded-2xl p-5 transition-all hover:shadow-md"
                style={{ background: 'rgba(31,179,143,0.08)', border: '1px solid rgba(31,179,143,0.25)' }}
              >
                <span className="text-4xl">🎨</span>
                <div>
                  <p className="font-bold" style={{ color: 'var(--vq-text)' }}>Open Sandbox</p>
                  <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>Build anything — no mission, no rules, pure creation</p>
                </div>
                <span className="ml-auto" style={{ color: 'var(--vq-primary)' }}>→</span>
              </Link>
            </div>

            {/* Mission grid */}
            <h2 className="font-semibold text-xl mb-4" style={{ color: 'var(--vq-text)' }}>
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
                    className={`relative rounded-3xl p-5 transition-all ${missionBorderClass(mission.type)} ${
                      isLocked
                        ? 'opacity-60 cursor-default'
                        : 'cursor-pointer hover:scale-105'
                    }`}
                    style={{
                      background: isCompleted ? 'rgba(31,179,143,0.06)' : 'var(--vq-card)',
                      border: isCompleted ? '1px solid rgba(31,179,143,0.3)' : '1px solid var(--vq-border)',
                    }}
                    onClick={() => !isLocked && router.push(`/play/${selectedChild.tier}/${mission.id}?childId=${selectedChild.id}`)}
                  >
                    {isCompleted && (
                      <div className="absolute top-3 right-3 text-xl" style={{ color: 'var(--vq-primary)' }}>✅</div>
                    )}
                    {isLocked && (
                      <div className="absolute top-3 right-3 text-xl" style={{ color: 'var(--vq-muted)' }}>🔒</div>
                    )}

                    <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${TIER_COLORS[selectedChild.tier]} text-white mb-3`}>
                      {mission.difficulty}
                    </div>
                    <h3 className="font-extrabold mb-1 leading-tight" style={{ color: 'var(--vq-text)' }}>{mission.title}</h3>
                    <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>

                    {mission.primarySkill && (
                      <p className="text-xs mt-3" style={{ color: 'var(--vq-primary)' }}>
                        {getSkillById(mission.primarySkill)?.icon} {getSkillById(mission.primarySkill)?.name}
                        {mission.xp && <span className="ml-2" style={{ color: 'var(--vq-accent-3)' }}>+{mission.xp} XP</span>}
                      </p>
                    )}

                    {missionProgress && !isCompleted && (
                      <p className="text-xs mt-1" style={{ color: 'var(--vq-muted)' }}>
                        {missionProgress.attempts} attempt{missionProgress.attempts !== 1 ? 's' : ''} so far
                      </p>
                    )}

                    {isLocked && (
                      <Link
                        href="/pricing"
                        onClick={e => e.stopPropagation()}
                        className="mt-3 inline-block text-xs hover:underline"
                        style={{ color: 'var(--vq-accent-3)' }}
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
