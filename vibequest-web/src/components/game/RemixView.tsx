'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mission } from '@/lib/missions';
import LivePreview from './LivePreview';
import VictoryScreen from './VictoryScreen';

interface Props {
  mission: Mission;
  childId: string;
  tier: 1 | 2 | 3;
}

export default function RemixView({ mission, childId, tier }: Props) {
  const router = useRouter();
  const originalCode = mission.starterCode ?? '';
  const challenges = mission.remixChallenges ?? [];
  const [currentCode, setCurrentCode] = useState(originalCode);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [showOriginal, setShowOriginal] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');

  const allDone = challenges.length > 0 && completedChallenges.length >= challenges.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remix_iterate',
          missionId: mission.id,
          originalCode,
          currentCode,
          kidDescription: input,
          challenges,
          tier,
        }),
      });

      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setCurrentCode(data.updatedCode);
      setExplanation(data.explanation);
      setInput('');

      const newCompleted = [...new Set([...completedChallenges, ...data.completedChallenges])];
      setCompletedChallenges(newCompleted);

      if (newCompleted.length >= challenges.length) {
        if (childId) {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childId, missionId: mission.id, completed: true, attempts: newAttempts }),
          });
        }
        setTimeout(() => setShowVictory(true), 1000);
      }
    } catch {
      setError('Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  if (showVictory) {
    return (
      <VictoryScreen
        mission={mission}
        attempts={attempts}
        tier={tier}
        childId={childId}
        finalCode={currentCode}
        onNext={() => router.push('/dashboard')}
        onReplay={() => {
          setShowVictory(false);
          setCurrentCode(originalCode);
          setCompletedChallenges([]);
          setAttempts(0);
          setInput('');
          setExplanation('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-pink-950 to-purple-950">
      <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-pink-300 hover:text-white transition-colors">← Back</Link>
        <span className="text-white font-bold">{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium">Remix Studio</span>
        {attempts > 0 && <span className="ml-auto text-pink-400 text-sm">{attempts} change{attempts !== 1 ? 's' : ''}</span>}
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-3">🎨</div>
            <p className="text-pink-200 text-sm leading-relaxed mb-4">{mission.story}</p>

            {/* Challenges checklist */}
            <div className="space-y-2">
              <p className="text-yellow-300 font-semibold text-sm mb-2">Challenges to complete:</p>
              {challenges.map((c, i) => {
                const done = completedChallenges.includes(c);
                return (
                  <div key={i} className={`flex items-start gap-2 text-sm p-2 rounded-lg ${done ? 'text-green-300' : 'text-white/70'}`}>
                    <span>{done ? '✅' : '⬜'}</span>
                    <span className={done ? 'line-through opacity-60' : ''}>{c}</span>
                  </div>
                );
              })}
            </div>

            {completedChallenges.length > 0 && !allDone && (
              <p className="text-green-400 text-xs mt-3">{completedChallenges.length}/{challenges.length} done — keep going!</p>
            )}
            {allDone && <p className="text-green-400 font-semibold text-sm mt-3">🎉 All challenges complete!</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-white font-semibold text-sm block">
              ✍️ Describe your next change:
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder='e.g. "Make the button say BOOM when clicked"'
              rows={4}
              className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm leading-relaxed"
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as any); }}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-lg"
            >
              {loading ? <span className="animate-pulse">🎨 Remixing...</span> : 'Remix it! 🎨'}
            </button>
          </form>

          {explanation && (
            <div className="bg-pink-500/10 border border-pink-400/30 rounded-2xl p-4">
              <p className="text-white text-sm">{explanation}</p>
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOriginal(false)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${!showOriginal ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
            >
              Your Remix
            </button>
            <button
              onClick={() => setShowOriginal(true)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${showOriginal ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
            >
              Original
            </button>
          </div>
          <LivePreview code={showOriginal ? originalCode : currentCode} loading={loading && !showOriginal} />
        </div>
      </div>
    </div>
  );
}
