'use client';

import { useEffect, useState } from 'react';
import { Mission } from '@/lib/missions';
import { getSkillById } from '@/lib/skills';

interface Props {
  mission: Mission;
  attempts: number;
  tier: 1 | 2 | 3;
  childId: string;
  onNext: () => void;
  onReplay: () => void;
  finalCode?: string; // for Ship It
}

interface Lesson {
  headline: string;
  explanation: string;
  realWorldExample: string;
  badge: string;
}

export default function VictoryScreen({ mission, attempts, tier, childId, onNext, onReplay, finalCode }: Props) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [shipped, setShipped] = useState(false);
  const [shipping, setShipping] = useState(false);
  const [shippedId, setShippedId] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const xpEarned = mission.xp ?? 0;
  const primarySkill = mission.primarySkill ? getSkillById(mission.primarySkill) : null;

  useEffect(() => {
    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'lesson_summary',
        missionId: mission.id,
        concept: mission.concept,
        attempts,
        difficulty: mission.difficulty,
        tier,
      }),
    })
      .then(r => r.json())
      .then(async (data: Lesson) => {
        setLesson(data);
        setLoading(false);

        if (childId && data.badge) {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              childId,
              missionId: mission.id,
              completed: true,
              attempts,
              badge: data.badge,
            }),
          });
        }
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleShipIt() {
    if (!finalCode || !childId || shipped || shipping) return;
    setShipping(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          title: `${mission.title} by me`,
          code: finalCode,
          tier,
          missionId: mission.id,
          skillId: mission.primarySkill ?? null,
        }),
      });
      const data = await res.json();
      setShippedId(data.id ?? '');
      setShipped(true);
    } catch {
      // silent
    } finally {
      setShipping(false);
    }
  }

  const celebrationEmojis = ['🎉', '✨', '🌟', '🏆', '🚀', '🎊'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: 'rgba(13,61,48,0.90)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-lg w-full text-center my-auto animate-scale-in">
        {/* Celebration */}
        <div className="flex justify-center gap-4 text-5xl mb-6">
          {celebrationEmojis.slice(0, 3).map((e, i) => (
            <span key={i} className="animate-float-up" style={{ animationDelay: `${i * 0.2}s`, animationDuration: '2s', animationIterationCount: 'infinite', animationDirection: 'alternate' }}>{e}</span>
          ))}
        </div>

        <h1 className="text-5xl font-black text-white mb-3" style={{ textShadow: '0 0 40px rgba(31,179,143,0.5)' }}>You Did It!</h1>
        <p className="mb-2 text-lg font-medium" style={{ color: '#a7f3d0' }}>
          {attempts === 1 ? 'First try — you are amazing!' : `Completed in ${attempts} attempts. Great perseverance!`}
        </p>

        {/* XP + Skill earned */}
        <div className="flex justify-center gap-3 mb-8">
          {xpEarned > 0 && (
            <span className="px-5 py-2.5 rounded-full font-bold text-lg animate-pulse" style={{ background: 'rgba(255,209,102,0.2)', border: '1px solid rgba(255,209,102,0.4)', color: '#FFD166' }}>
              +{xpEarned} XP ⚡
            </span>
          )}
          {primarySkill && (
            <span className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: 'rgba(124,77,255,0.2)', border: '1px solid rgba(124,77,255,0.4)', color: '#c4b5fd' }}>
              {primarySkill.icon} {primarySkill.name}
            </span>
          )}
        </div>

        {loading ? (
          <div className="rounded-3xl p-8 text-white animate-pulse" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
            Generating your badge... 🏅
          </div>
        ) : lesson ? (
          <div className="rounded-3xl p-8 text-left space-y-5" style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
            {/* Badge */}
            <div className="text-center">
              <div className="inline-block rounded-2xl px-8 py-4 animate-pulse-glow" style={{ background: 'rgba(255,209,102,0.15)', border: '2px solid rgba(255,209,102,0.4)' }}>
                <div className="text-3xl mb-1">🏅</div>
                <div className="font-black text-xl" style={{ color: '#FFD166' }}>{lesson.badge}</div>
              </div>
            </div>

            {/* Skill practiced */}
            {primarySkill && (
              <div className="bg-purple-500/10 border border-purple-400/20 rounded-2xl p-4 text-center">
                <p className="text-purple-300 text-xs font-semibold mb-1">Skill practiced:</p>
                <p className="text-white font-bold">{primarySkill.icon} {primarySkill.name}</p>
                <p className="text-purple-200 text-xs mt-1">{primarySkill.shortDescription}</p>
              </div>
            )}

            {/* Headline */}
            <div className="text-center">
              <p className="text-white font-bold text-xl">{lesson.headline}</p>
            </div>

            {/* Explanation */}
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-purple-200 text-sm leading-relaxed">{lesson.explanation}</p>
            </div>

            {/* Real world */}
            <div className="bg-blue-500/10 border border-blue-400/20 rounded-2xl p-4">
              <p className="text-blue-300 text-xs font-semibold mb-1">🌍 In the real world:</p>
              <p className="text-blue-200 text-sm">{lesson.realWorldExample}</p>
            </div>

            {/* Ship It + Share buttons */}
            {finalCode && !shipped && (
              <button
                onClick={handleShipIt}
                disabled={shipping}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all"
              >
                {shipping ? 'Shipping...' : '🚀 Ship It! Save to Gallery'}
              </button>
            )}
            {shipped && (
              <div className="space-y-3">
                <div className="text-center text-green-300 font-semibold">
                  ✅ Saved to the Gallery!
                </div>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/gallery/${shippedId}`;
                    if (navigator.share) {
                      navigator.share({ title: `${mission.title} — VibeQuest`, url }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(url);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }
                  }}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/20"
                >
                  {shareCopied ? '✅ Link copied!' : '🔗 Share with friends'}
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onReplay}
            className="flex-1 py-4 text-white font-semibold rounded-2xl transition-all hover:scale-[1.02]"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            Play Again 🔁
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-4 text-white font-bold rounded-2xl transition-all hover:scale-[1.02] vq-btn-primary"
          >
            Next Mission →
          </button>
        </div>
      </div>
    </div>
  );
}
