'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMissionById } from '@/lib/missions';
import { executeBlocks, AnimationFrame } from '@/lib/gameEngine';
import { executeScene, SceneFrame } from '@/lib/sceneEngine';
import GridGame from '@/components/game/GridGame';
import LogicBlockTree from '@/components/game/LogicBlockTree';
import StarsGame from '@/components/game/StarsGame';
import SceneGame from '@/components/game/SceneGame';
import LivePreview from '@/components/game/LivePreview';
import VoiceInput from '@/components/ui/VoiceInput';
import BuilderView from '@/components/game/BuilderView';
import GameBuilder from '@/components/game/GameBuilder';
import MusicBuilder from '@/components/game/MusicBuilder';
import DebugView from '@/components/game/DebugView';
import RemixView from '@/components/game/RemixView';
import SpecView from '@/components/game/SpecView';
import JudgeView from '@/components/game/JudgeView';
import VictoryScreen from '@/components/game/VictoryScreen';

interface AIResult {
  logicBlocks: any[];
  code: string;
  explanation: string;
  success: boolean;
  hint: string;
  pseudoCode?: string;
  promptTips?: string[];
}

export default function PlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tier = parseInt(params.tier as string) as 1 | 2 | 3;
  const missionId = params.missionId as string;
  const childId = searchParams.get('childId') ?? '';

  const mission = getMissionById(missionId);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [frames, setFrames] = useState<AnimationFrame[]>([]);
  const [sceneFrames, setSceneFrames] = useState<SceneFrame[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--vq-bg)', color: 'var(--vq-text)' }}>
        Mission not found. <Link href="/dashboard" className="ml-2 underline" style={{ color: 'var(--vq-primary)' }}>Go back</Link>
      </div>
    );
  }

  // Builder missions get their own full-page layout
  if (mission.type === 'builder') {
    return (
      <BuilderView
        mission={mission}
        childId={childId}
        tier={tier}
      />
    );
  }

  if (mission.type === 'game-builder') {
    return (
      <GameBuilder
        mission={mission}
        childId={childId}
        tier={tier}
      />
    );
  }

  if (mission.type === 'debug') {
    return <DebugView mission={mission} childId={childId} tier={tier} />;
  }

  if (mission.type === 'remix') {
    return <RemixView mission={mission} childId={childId} tier={tier} />;
  }

  if (mission.type === 'spec') {
    return <SpecView mission={mission} childId={childId} tier={tier} />;
  }

  if (mission.type === 'judge') {
    return <JudgeView mission={mission} childId={childId} tier={tier} />;
  }

  if (mission.type === 'music') {
    return <MusicBuilder mission={mission} childId={childId} tier={tier} />;
  }

  const difficulty = mission!.difficulty as 'easy' | 'medium' | 'hard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError('');
    setResult(null);
    setFrames([]);
    setSceneFrames([]);

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          missionId,
          userDescription: input,
          missionContext: mission!.challenge,
          difficulty,
          tier,
        }),
      });

      if (res.status === 402) {
        router.push('/pricing?locked=true');
        return;
      }

      if (!res.ok) throw new Error('AI request failed');

      const data: AIResult = await res.json();
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setResult(data);

      // Run animation for grid missions
      const m = mission!;
      if (m.type === 'grid' && m.grid && data.logicBlocks) {
        const animFrames = executeBlocks(data.logicBlocks, {
          grid: m.grid,
          cols: m.cols!,
          rows: m.rows!,
          goal: m.goal!,
          robotStart: m.robotStart!,
          robotDir: m.robotDir,
        });
        setFrames(animFrames);
      }

      // Run scene animation for logic missions with sceneConfig
      if (m.type === 'logic' && m.sceneConfig && data.logicBlocks) {
        const scenes = executeScene(m.sceneConfig.sceneId, data.logicBlocks);
        setSceneFrames(scenes);
      }

      if (data.success) {
        // Save progress
        if (childId) {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ childId, missionId, completed: true, attempts: newAttempts }),
          });
        }
        setTimeout(() => setShowVictory(true), m.type === 'grid' ? 2500 : 1200);
      }
    } catch {
      setError('Oops! Something went wrong. Try again!');
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
          setResult(null);
          setInput('');
          setAttempts(0);
          setFrames([]);
          setSceneFrames([]);
        }}
      />
    );
  }

  const placeholders: Record<1 | 2 | 3, string> = {
    1: 'Tell ROVI what to do in your own words! e.g. "Check if there is a wall ahead, then turn right and move forward"',
    2: 'Write your solution or describe it. e.g. "loop through items, if item is a carrot eat it, else skip"',
    3: 'Describe exactly what you want the AI to build. Be specific — the more detail, the better!',
  };

  // Determine if this mission uses LivePreview (code/app types)
  const usesLivePreview = mission.type === 'code' || mission.type === 'app';

  return (
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/dashboard" className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>
          ← Back
        </Link>
        <div className="flex-1">
          <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
          <span className={`ml-3 text-xs px-2 py-0.5 rounded-full font-medium`} style={{
            background: difficulty === 'easy' ? 'rgba(31,179,143,0.12)' : difficulty === 'medium' ? 'rgba(255,209,102,0.15)' : 'rgba(239,68,68,0.12)',
            color: difficulty === 'easy' ? 'var(--vq-primary)' : difficulty === 'medium' ? '#A0780A' : '#EF4444',
          }}>{difficulty}</span>
        </div>
        {attempts > 0 && (
          <span className="text-sm" style={{ color: 'var(--vq-muted)' }}>{attempts} attempt{attempts !== 1 ? 's' : ''}</span>
        )}
      </header>

      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Story + Input */}
        <div className="space-y-4">
          {/* Story card */}
          <div className="rounded-2xl p-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
            <div className="text-3xl mb-3">📖</div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>
            <div className="rounded-xl p-4" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--vq-accent-3)' }}>Your mission:</p>
              <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{mission.challenge}</p>
            </div>
            {(attempts === 0 || result?.hint) && (
              <div className="mt-3 text-xs" style={{ color: 'var(--vq-muted)' }}>
                💡 <span className="italic">{result?.hint ?? mission.starterHint}</span>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="font-semibold text-sm block" style={{ color: 'var(--vq-text)' }}>
              {tier === 1 ? '🗣️ Tell the AI your solution:' : tier === 2 ? '✍️ Write your solution:' : '🎯 Write your prompt:'}
            </label>

            {/* Tier 2: show starter code */}
            {tier === 2 && mission.starterCode && (
              <pre className="text-xs rounded-xl p-4 overflow-x-auto" style={{ background: '#0D3D30', color: '#4ECDC4' }}>{mission.starterCode}</pre>
            )}

            <VoiceInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
              placeholder={placeholders[tier]}
              rows={tier === 1 ? 4 : 6}
              disabled={loading}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-4 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-lg"
              style={{ background: 'var(--vq-primary)' }}
            >
              {loading ? (
                <span className="animate-pulse">✨ Thinking...</span>
              ) : (
                <>Run it! ✨ <span className="text-sm font-normal opacity-70">(⌘+Enter)</span></>
              )}
            </button>
          </form>

          {/* AI explanation */}
          {result && (
            <div className="rounded-2xl p-5" style={{
              background: result.success ? 'rgba(31,179,143,0.06)' : 'rgba(249,115,22,0.06)',
              border: `1px solid ${result.success ? 'rgba(31,179,143,0.25)' : 'rgba(249,115,22,0.25)'}`,
            }}>
              <div className="text-2xl mb-2">{result.success ? '🎉' : '🤔'}</div>
              <p className="font-semibold mb-1" style={{ color: 'var(--vq-text)' }}>{result.explanation}</p>

              {tier === 2 && result.pseudoCode && (
                <pre className="text-xs rounded-lg p-3 mt-3 overflow-x-auto" style={{ background: '#0D3D30', color: '#4ECDC4' }}>{result.pseudoCode}</pre>
              )}

              {tier === 3 && result.promptTips && (
                <div className="mt-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: 'var(--vq-muted)' }}>Prompt tips:</p>
                  <ul className="space-y-1">
                    {result.promptTips.map((tip, i) => (
                      <li key={i} className="text-xs" style={{ color: 'var(--vq-muted)' }}>• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => setShowCode(!showCode)}
                className="mt-3 text-xs underline transition-colors hover:text-[var(--vq-text)]"
                style={{ color: 'var(--vq-muted)' }}
              >
                {showCode ? 'Hide' : 'Show'} real code
              </button>
              {showCode && result.code && (
                <pre className="text-xs rounded-lg p-3 mt-2 overflow-x-auto whitespace-pre-wrap" style={{ background: '#0D3D30', color: '#4ECDC4' }}>{result.code}</pre>
              )}
            </div>
          )}
        </div>

        {/* Right: Game visualization */}
        <div className="space-y-4">
          {/* Grid game */}
          {mission.type === 'grid' && (
            <GridGame
              grid={mission.grid!}
              cols={mission.cols!}
              rows={mission.rows!}
              goal={mission.goal!}
              robotStart={mission.robotStart!}
              robotDir={mission.robotDir ?? 'right'}
              frames={frames}
              theme={mission.theme}
            />
          )}

          {/* Stars game */}
          {mission.type === 'stars' && (
            <StarsGame
              totalStars={5}
              success={result?.success ?? false}
              loading={loading}
            />
          )}

          {/* Logic missions: SceneGame if sceneConfig, else fallback */}
          {mission.type === 'logic' && mission.sceneConfig && (
            <SceneGame
              sceneConfig={mission.sceneConfig}
              frames={sceneFrames}
              loading={loading}
            />
          )}

          {/* Code/App missions: LivePreview */}
          {usesLivePreview && (
            <LivePreview
              code={result?.code ?? ''}
              loading={loading}
            />
          )}

          {/* Logic block tree — collapsible "peek under the hood" */}
          {result?.logicBlocks && (
            <details className="rounded-2xl overflow-hidden" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
              <summary className="px-5 py-3 text-sm cursor-pointer transition-colors flex items-center gap-2 hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-muted)' }}>
                <span>🔍</span>
                <span>Peek under the hood — Logic Blocks</span>
              </summary>
              <div className="px-5 pb-4">
                <LogicBlockTree blocks={result.logicBlocks} />
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}
