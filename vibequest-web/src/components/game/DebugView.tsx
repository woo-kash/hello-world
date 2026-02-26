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

export default function DebugView({ mission, childId, tier }: Props) {
  const router = useRouter();
  const [currentCode, setCurrentCode] = useState(mission.buggyCode ?? '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [hint, setHint] = useState('');
  const [explanation, setExplanation] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');

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
          action: 'debug_check',
          missionId: mission.id,
          buggyCode: currentCode,
          kidDescription: input,
          missionContext: mission.challenge,
          tier,
        }),
      });

      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error('Request failed');

      const data = await res.json();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setCurrentCode(data.fixedCode);
      setHint(data.hint);
      setExplanation(data.explanation);
      setInput('');

      if (data.resolved) {
        setResolved(true);
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
        onNext={() => router.push('/dashboard')}
        onReplay={() => {
          setShowVictory(false);
          setCurrentCode(mission.buggyCode ?? '');
          setResolved(false);
          setAttempts(0);
          setInput('');
          setHint('');
          setExplanation('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-gray-950">
      <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-red-300 hover:text-white transition-colors">← Back</Link>
        <span className="text-white font-bold">{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-medium">Debug Detective</span>
        {attempts > 0 && <span className="ml-auto text-red-400 text-sm">{attempts} attempt{attempts !== 1 ? 's' : ''}</span>}
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: story + input */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-3xl mb-3">🐛</div>
            <p className="text-red-200 text-sm leading-relaxed mb-4">{mission.story}</p>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-yellow-300 font-semibold text-sm mb-1">Your mission:</p>
              <p className="text-white text-sm">{mission.challenge}</p>
            </div>
            <div className="mt-3 text-red-300 text-xs">
              💡 <span className="italic">{mission.starterHint}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="text-white font-semibold text-sm block">
              🔍 Describe what is going wrong:
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="What do you see happening? What should happen instead? Be specific!"
              rows={5}
              className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-red-400 text-sm leading-relaxed"
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as any); }}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-lg"
            >
              {loading ? <span className="animate-pulse">🔍 Investigating...</span> : 'Fix the Bug! 🐛'}
            </button>
          </form>

          {explanation && (
            <div className={`rounded-2xl p-5 border ${resolved ? 'bg-green-500/10 border-green-400/30' : 'bg-orange-500/10 border-orange-400/30'}`}>
              <div className="text-2xl mb-2">{resolved ? '✅' : '🤔'}</div>
              <p className="text-white font-semibold mb-2">{explanation}</p>
              {hint && <p className="text-orange-300 text-sm italic">Hint: {hint}</p>}
            </div>
          )}
        </div>

        {/* Right: broken app preview */}
        <div className="space-y-4">
          <div className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
            {resolved ? '✅ Fixed App' : '🐛 Buggy App — what do you see going wrong?'}
          </div>
          <LivePreview code={currentCode} loading={loading} />
        </div>
      </div>
    </div>
  );
}
