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

type Phase = 'write' | 'refine' | 'build' | 'evaluate';

export default function SpecView({ mission, childId, tier }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('write');
  const [spec, setSpec] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [missing, setMissing] = useState<string[]>([]);
  const [builtCode, setBuiltCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');

  async function handleEvaluate(e: React.FormEvent) {
    e.preventDefault();
    if (!spec.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spec_evaluate', missionId: mission.id, spec, missionContext: mission.challenge, tier }),
      });
      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setScore(data.score);
      setFeedback(data.feedback);
      setMissing(data.missingElements ?? []);
      setAttempts(a => a + 1);
      setPhase(data.score >= 8 ? 'build' : 'refine');
    } catch {
      setError('Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuild() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'spec_build', missionId: mission.id, spec, missionContext: mission.challenge, tier }),
      });
      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setBuiltCode(data.html);
      setPhase('evaluate');
    } catch {
      setError('Build failed. Try again!');
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (childId) {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, missionId: mission.id, completed: true, attempts }),
      });
    }
    setShowVictory(true);
  }

  if (showVictory) {
    return (
      <VictoryScreen
        mission={mission}
        attempts={attempts}
        tier={tier}
        childId={childId}
        finalCode={builtCode}
        onNext={() => router.push('/dashboard')}
        onReplay={() => { setShowVictory(false); setPhase('write'); setSpec(''); setScore(0); setBuiltCode(''); setAttempts(0); }}
      />
    );
  }

  const scoreColor = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = score >= 8 ? 'bg-green-500/10 border-green-400/30' : score >= 5 ? 'bg-yellow-500/10 border-yellow-400/30' : 'bg-red-500/10 border-red-400/30';

  return (
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/dashboard" className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</Link>
        <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}>Spec Writer</span>
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>
            <div className="rounded-xl p-4" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--vq-accent-3)' }}>Your mission:</p>
              <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{mission.challenge}</p>
            </div>
            <p className="text-xs mt-3 italic" style={{ color: 'var(--vq-muted)' }}>💡 {mission.starterHint}</p>
          </div>

          {/* Phase indicators */}
          <div className="flex gap-2">
            {(['write', 'refine', 'build', 'evaluate'] as Phase[]).map((p, i) => (
              <div key={p} className="flex-1 h-1.5 rounded-full" style={{ background: (phase === p || i < ['write','refine','build','evaluate'].indexOf(phase)) ? 'var(--vq-primary)' : 'var(--vq-border)' }} />
            ))}
          </div>
          <div className="text-xs text-center" style={{ color: 'var(--vq-muted)' }}>
            {phase === 'write' ? 'Step 1: Write your spec' : phase === 'refine' ? 'Step 2: Improve your spec' : phase === 'build' ? 'Step 3: Build from spec' : 'Step 4: Does it match?'}
          </div>

          {(phase === 'write' || phase === 'refine') && (
            <form onSubmit={handleEvaluate} className="space-y-3">
              <label className="font-semibold text-sm block" style={{ color: 'var(--vq-text)' }}>
                {phase === 'write' ? '✍️ Write your spec:' : '✍️ Improve your spec (score needed: 8/10):'}
              </label>

              {phase === 'refine' && feedback && (
                <div className="rounded-2xl p-4" style={{
                  background: score >= 8 ? 'rgba(31,179,143,0.06)' : score >= 5 ? 'rgba(255,209,102,0.08)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${score >= 8 ? 'rgba(31,179,143,0.25)' : score >= 5 ? 'rgba(255,209,102,0.3)' : 'rgba(239,68,68,0.25)'}`,
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl font-bold" style={{ color: scoreColor.includes('green') ? 'var(--vq-primary)' : scoreColor.includes('yellow') ? '#D4A017' : '#EF4444' }}>{score}/10</span>
                    <span className="text-sm" style={{ color: 'var(--vq-muted)' }}>Spec Score</span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: 'var(--vq-text)' }}>{feedback}</p>
                  {missing.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--vq-accent-3)' }}>Still missing:</p>
                      <ul className="space-y-1">
                        {missing.map((m, i) => <li key={i} className="text-xs" style={{ color: 'var(--vq-muted)' }}>• {m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <VoiceInput
                value={spec}
                onChange={setSpec}
                placeholder="Describe every feature, what it looks like, and what happens in edge cases. The more detail, the better your score!"
                rows={8}
                disabled={loading}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || !spec.trim()}
                className="w-full py-4 disabled:opacity-40 text-white font-bold rounded-xl transition-colors"
                style={{ background: '#3B82F6' }}
              >
                {loading ? <span className="animate-pulse">📋 Evaluating...</span> : 'Score my spec!'}
              </button>
            </form>
          )}

          {phase === 'build' && (
            <div className="space-y-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(31,179,143,0.06)', border: '1px solid rgba(31,179,143,0.25)' }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--vq-primary)' }}>{score}/10</span>
                <span className="text-sm ml-2" style={{ color: 'var(--vq-muted)' }}>— spec approved!</span>
                <p className="text-sm mt-1" style={{ color: 'var(--vq-primary)' }}>{feedback}</p>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                onClick={handleBuild}
                disabled={loading}
                className="w-full py-4 disabled:opacity-40 text-white font-bold rounded-xl transition-colors"
                style={{ background: '#22C55E' }}
              >
                {loading ? <span className="animate-pulse">🔨 Building...</span> : '🔨 Build it from my spec!'}
              </button>
            </div>
          )}

          {phase === 'evaluate' && (
            <div className="space-y-3">
              <p className="font-semibold" style={{ color: 'var(--vq-text)' }}>Does the app match your spec?</p>
              <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>Compare what you described with what was built. If it matches, you win!</p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 text-white font-bold rounded-xl"
                  style={{ background: '#22C55E' }}
                >
                  ✅ Yes, it matches!
                </button>
                <button
                  onClick={() => setPhase('write')}
                  className="flex-1 py-3 rounded-xl font-bold"
                  style={{ border: '1px solid var(--vq-border)', color: 'var(--vq-muted)' }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div>
          {phase === 'evaluate' && builtCode ? (
            <LivePreview code={builtCode} loading={loading} />
          ) : (
            <div className="rounded-2xl p-8 flex flex-col items-center justify-center h-full text-center" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
              <div className="text-6xl mb-4">📋</div>
              <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>Write a great spec and the AI will build it here!</p>
              <p className="text-xs mt-2" style={{ color: 'var(--vq-muted)' }}>Score 8/10 or higher to unlock the build</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
