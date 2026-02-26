'use client';

import { useEffect, useState } from 'react';
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

interface Variant {
  code: string;
  label: string;
}

export default function JudgeView({ mission, childId, tier }: Props) {
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [flaws, setFlaws] = useState<string[]>([]);
  const [generating, setGenerating] = useState(true);
  const [pickedIndex, setPickedIndex] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<{ correct: boolean; feedback: string; explanation: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'judge_generate', missionId: mission.id, missionSpec: mission.challenge, tier }),
    })
      .then(r => { if (r.status === 402) { router.push('/pricing?locked=true'); throw new Error('402'); } return r.json(); })
      .then(data => {
        setVariants(data.variants ?? []);
        setCorrectIndex(data.correctIndex ?? 0);
        setFlaws(data.flaws ?? []);
        setGenerating(false);
      })
      .catch(() => { setGenerating(false); setError('Failed to generate variants. Try refreshing.'); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pickedIndex === null || !reasoning.trim() || evaluating) return;
    setEvaluating(true);
    setError('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'judge_evaluate', missionId: mission.id, pickedIndex, correctIndex, kidReasoning: reasoning, flaws, tier }),
      });
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setEvalResult(data);
      setAttempts(a => a + 1);

      if (data.correct) {
        if (childId) {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childId, missionId: mission.id, completed: true, attempts: attempts + 1 }),
          });
        }
        setTimeout(() => setShowVictory(true), 1500);
      }
    } catch {
      setError('Something went wrong. Try again!');
    } finally {
      setEvaluating(false);
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
        onReplay={() => { setShowVictory(false); setPickedIndex(null); setReasoning(''); setEvalResult(null); setAttempts(0); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-yellow-950 to-orange-950">
      <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-yellow-300 hover:text-white transition-colors">← Back</Link>
        <span className="text-white font-bold">{mission.title}</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 font-medium">AI Judge</span>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Story */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="text-3xl mb-3">⚖️</div>
          <p className="text-yellow-200 text-sm leading-relaxed mb-3">{mission.story}</p>
          <p className="text-white text-sm font-semibold">{mission.challenge}</p>
          <p className="text-yellow-300 text-xs mt-2 italic">💡 {mission.starterHint}</p>
        </div>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {generating ? (
          <div className="text-white text-center animate-pulse py-20">Generating 3 app variants... ⚖️</div>
        ) : (
          <>
            {/* 3 variants side by side */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {variants.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setPickedIndex(i)}
                  className={`rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                    pickedIndex === i ? 'border-yellow-400 scale-[1.02]' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className={`px-4 py-2 text-sm font-bold flex items-center justify-between ${pickedIndex === i ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/5 text-white/60'}`}>
                    <span>{v.label}</span>
                    {pickedIndex === i && <span>✓ Selected</span>}
                  </div>
                  <div className="h-64">
                    <LivePreview code={v.code} loading={false} />
                  </div>
                </div>
              ))}
            </div>

            {/* Reasoning form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
              {pickedIndex !== null && (
                <p className="text-yellow-300 text-sm font-semibold text-center">
                  You selected {variants[pickedIndex]?.label} — now explain why it's the best!
                </p>
              )}
              <textarea
                value={reasoning}
                onChange={e => setReasoning(e.target.value)}
                placeholder={pickedIndex !== null ? "Why did you pick this one? What's wrong with the other two?" : "Pick a version above first, then explain your choice here"}
                rows={4}
                disabled={pickedIndex === null}
                className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm disabled:opacity-40"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={evaluating || pickedIndex === null || !reasoning.trim()}
                className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 text-gray-900 font-bold rounded-xl transition-colors"
              >
                {evaluating ? 'Evaluating...' : 'Submit my verdict! ⚖️'}
              </button>
            </form>

            {/* Eval result */}
            {evalResult && (
              <div className={`max-w-2xl mx-auto mt-4 rounded-2xl p-5 border ${evalResult.correct ? 'bg-green-500/10 border-green-400/30' : 'bg-orange-500/10 border-orange-400/30'}`}>
                <div className="text-2xl mb-2">{evalResult.correct ? '✅' : '🤔'}</div>
                <p className="text-white font-semibold mb-2">{evalResult.feedback}</p>
                <p className="text-white/70 text-sm">{evalResult.explanation}</p>
                {!evalResult.correct && (
                  <button
                    onClick={() => { setPickedIndex(null); setReasoning(''); setEvalResult(null); }}
                    className="mt-3 text-yellow-400 text-sm underline"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
