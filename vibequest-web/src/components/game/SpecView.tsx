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
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-indigo-950">
      <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-blue-300 hover:text-white transition-colors">← Back</Link>
        <span className="text-white font-bold">{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">Spec Writer</span>
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">{mission.story}</p>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-yellow-300 font-semibold text-sm mb-1">Your mission:</p>
              <p className="text-white text-sm">{mission.challenge}</p>
            </div>
            <p className="text-blue-300 text-xs mt-3 italic">💡 {mission.starterHint}</p>
          </div>

          {/* Phase indicators */}
          <div className="flex gap-2">
            {(['write', 'refine', 'build', 'evaluate'] as Phase[]).map((p, i) => (
              <div key={p} className={`flex-1 h-1.5 rounded-full ${phase === p || (i < ['write','refine','build','evaluate'].indexOf(phase)) ? 'bg-blue-500' : 'bg-white/10'}`} />
            ))}
          </div>
          <div className="text-white/50 text-xs text-center">
            {phase === 'write' ? 'Step 1: Write your spec' : phase === 'refine' ? 'Step 2: Improve your spec' : phase === 'build' ? 'Step 3: Build from spec' : 'Step 4: Does it match?'}
          </div>

          {(phase === 'write' || phase === 'refine') && (
            <form onSubmit={handleEvaluate} className="space-y-3">
              <label className="text-white font-semibold text-sm block">
                {phase === 'write' ? '✍️ Write your spec:' : '✍️ Improve your spec (score needed: 8/10):'}
              </label>

              {phase === 'refine' && feedback && (
                <div className={`rounded-2xl p-4 border ${scoreBg}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-2xl font-bold ${scoreColor}`}>{score}/10</span>
                    <span className="text-white/60 text-sm">Spec Score</span>
                  </div>
                  <p className="text-white text-sm mb-2">{feedback}</p>
                  {missing.length > 0 && (
                    <div>
                      <p className="text-yellow-300 text-xs font-semibold mb-1">Still missing:</p>
                      <ul className="space-y-1">
                        {missing.map((m, i) => <li key={i} className="text-white/70 text-xs">• {m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={spec}
                onChange={e => setSpec(e.target.value)}
                placeholder="Describe every feature, what it looks like, and what happens in edge cases. The more detail, the better your score!"
                rows={8}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm leading-relaxed"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading || !spec.trim()}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors"
              >
                {loading ? <span className="animate-pulse">📋 Evaluating...</span> : 'Score my spec!'}
              </button>
            </form>
          )}

          {phase === 'build' && (
            <div className="space-y-3">
              <div className={`rounded-2xl p-4 border ${scoreBg}`}>
                <span className={`text-2xl font-bold ${scoreColor}`}>{score}/10</span>
                <span className="text-white/60 text-sm ml-2">— spec approved!</span>
                <p className="text-green-300 text-sm mt-1">{feedback}</p>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                onClick={handleBuild}
                disabled={loading}
                className="w-full py-4 bg-green-600 hover:bg-green-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors"
              >
                {loading ? <span className="animate-pulse">🔨 Building...</span> : '🔨 Build it from my spec!'}
              </button>
            </div>
          )}

          {phase === 'evaluate' && (
            <div className="space-y-3">
              <p className="text-white font-semibold">Does the app match your spec?</p>
              <p className="text-purple-300 text-sm">Compare what you described with what was built. If it matches, you win!</p>
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl"
                >
                  ✅ Yes, it matches!
                </button>
                <button
                  onClick={() => setPhase('write')}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl"
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
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-white/60 text-sm">Write a great spec and the AI will build it here!</p>
              <p className="text-white/40 text-xs mt-2">Score 8/10 or higher to unlock the build</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
