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
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/dashboard" className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</Link>
        <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,107,107,0.12)', color: '#EF4444' }}>Debug Detective</span>
        {attempts > 0 && <span className="ml-auto text-sm" style={{ color: 'var(--vq-muted)' }}>{attempts} attempt{attempts !== 1 ? 's' : ''}</span>}
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: story + input */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
            <div className="text-3xl mb-3">🐛</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>
            <div className="rounded-xl p-4" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--vq-accent-3)' }}>Your mission:</p>
              <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{mission.challenge}</p>
            </div>
            <div className="mt-3 text-xs" style={{ color: 'var(--vq-muted)' }}>
              💡 <span className="italic">{mission.starterHint}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="font-semibold text-sm block" style={{ color: 'var(--vq-text)' }}>
              🔍 Describe what is going wrong:
            </label>
            <VoiceInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              placeholder="What do you see happening? What should happen instead? Be specific!"
              rows={5}
              disabled={loading}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-4 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-lg"
              style={{ background: '#EF4444' }}
            >
              {loading ? <span className="animate-pulse">🔍 Investigating...</span> : 'Fix the Bug! 🐛'}
            </button>
          </form>

          {explanation && (
            <div className={`rounded-2xl p-5 border ${resolved ? '' : ''}`} style={{
              background: resolved ? 'rgba(31,179,143,0.06)' : 'rgba(249,115,22,0.06)',
              borderColor: resolved ? 'rgba(31,179,143,0.25)' : 'rgba(249,115,22,0.25)',
              borderWidth: 1,
              borderStyle: 'solid',
            }}>
              <div className="text-2xl mb-2">{resolved ? '✅' : '🤔'}</div>
              <p className="font-semibold mb-2" style={{ color: 'var(--vq-text)' }}>{explanation}</p>
              {hint && <p className="text-sm italic" style={{ color: 'var(--vq-muted)' }}>Hint: {hint}</p>}
            </div>
          )}
        </div>

        {/* Right: broken app preview */}
        <div className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--vq-muted)' }}>
            {resolved ? '✅ Fixed App' : '🐛 Buggy App — what do you see going wrong?'}
          </div>
          <LivePreview code={currentCode} loading={loading} />
        </div>
      </div>
    </div>
  );
}
