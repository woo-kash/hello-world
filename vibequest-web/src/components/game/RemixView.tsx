'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mission } from '@/lib/missions';
import LivePreview from './LivePreview';
import VictoryScreen from './VictoryScreen';
import VoiceInput from '@/components/ui/VoiceInput';

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
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/dashboard" className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</Link>
        <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(236,72,153,0.12)', color: '#EC4899' }}>Remix Studio</span>
        {attempts > 0 && <span className="ml-auto text-sm" style={{ color: 'var(--vq-muted)' }}>{attempts} change{attempts !== 1 ? 's' : ''}</span>}
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
            <div className="text-3xl mb-3">🎨</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>

            <div className="space-y-2">
              <p className="font-semibold text-sm mb-2" style={{ color: 'var(--vq-accent-3)' }}>Challenges to complete:</p>
              {challenges.map((c, i) => {
                const done = completedChallenges.includes(c);
                return (
                  <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg" style={{ color: done ? 'var(--vq-primary)' : 'var(--vq-muted)' }}>
                    <span>{done ? '✅' : '⬜'}</span>
                    <span className={done ? 'line-through opacity-60' : ''}>{c}</span>
                  </div>
                );
              })}
            </div>

            {completedChallenges.length > 0 && !allDone && (
              <p className="text-xs mt-3" style={{ color: 'var(--vq-primary)' }}>{completedChallenges.length}/{challenges.length} done — keep going!</p>
            )}
            {allDone && <p className="font-semibold text-sm mt-3" style={{ color: 'var(--vq-primary)' }}>🎉 All challenges complete!</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="font-semibold text-sm block" style={{ color: 'var(--vq-text)' }}>
              ✍️ Describe your next change:
            </label>
            <VoiceInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              placeholder='e.g. "Make the button say BOOM when clicked"'
              rows={4}
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-4 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-lg"
              style={{ background: '#EC4899' }}
            >
              {loading ? <span className="animate-pulse">🎨 Remixing...</span> : 'Remix it! 🎨'}
            </button>
          </form>

          {explanation && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.2)' }}>
              <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{explanation}</p>
            </div>
          )}
        </div>

        {/* Right: live preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOriginal(false)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ background: !showOriginal ? '#EC4899' : 'var(--vq-border)', color: !showOriginal ? 'white' : 'var(--vq-muted)' }}
            >
              Your Remix
            </button>
            <button
              onClick={() => setShowOriginal(true)}
              className="text-xs px-3 py-1.5 rounded-full transition-colors"
              style={{ background: showOriginal ? 'var(--vq-border)' : 'var(--vq-bg)', color: showOriginal ? 'var(--vq-text)' : 'var(--vq-muted)', border: '1px solid var(--vq-border)' }}
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
