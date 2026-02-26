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
      await fetch('/api/gallery', {
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
      setShipped(true);
    } catch {
      // silent
    } finally {
      setShipping(false);
    }
  }

  const celebrationEmojis = ['🎉', '✨', '🌟', '🏆', '🚀', '🎊'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Celebration */}
        <div className="flex justify-center gap-3 text-4xl mb-6 animate-bounce">
          {celebrationEmojis.slice(0, 3).map((e, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </div>

        <h1 className="text-4xl font-bold text-white mb-2">You Did It!</h1>
        <p className="text-purple-200 mb-2">
          {attempts === 1 ? 'First try — you are amazing!' : `Completed in ${attempts} attempts. Great perseverance!`}
        </p>

        {/* XP + Skill earned */}
        <div className="flex justify-center gap-3 mb-6">
          {xpEarned > 0 && (
            <span className="bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-4 py-2 rounded-full font-bold">
              +{xpEarned} XP ⚡
            </span>
          )}
          {primarySkill && (
            <span className="bg-purple-500/20 border border-purple-400/40 text-purple-200 px-4 py-2 rounded-full text-sm">
              {primarySkill.icon} {primarySkill.name}
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white/10 rounded-3xl p-8 text-white animate-pulse">
            Generating your badge... 🏅
          </div>
        ) : lesson ? (
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-left space-y-5">
            {/* Badge */}
            <div className="text-center">
              <div className="inline-block bg-yellow-400/20 border-2 border-yellow-400/50 rounded-2xl px-6 py-3">
                <div className="text-yellow-400 text-xl mb-1">🏅</div>
                <div className="text-yellow-300 font-bold text-lg">{lesson.badge}</div>
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

            {/* Ship It button */}
            {finalCode && !shipped && (
              <button
                onClick={handleShipIt}
                disabled={shipping}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all"
              >
                {shipping ? 'Shipping...' : '🚀 Ship It! Share your creation'}
              </button>
            )}
            {shipped && (
              <div className="text-center text-green-300 font-semibold">
                ✅ Shipped to the Gallery!
              </div>
            )}
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onReplay}
            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-colors"
          >
            Play Again 🔁
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold rounded-2xl transition-colors"
          >
            Next Mission →
          </button>
        </div>
      </div>
    </div>
  );
}
