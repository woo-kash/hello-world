'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GameBuilder from '@/components/game/GameBuilder';
import BuilderView from '@/components/game/BuilderView';
import type { Mission } from '@/lib/missions';

type Template = 'game' | 'app' | 'tool' | 'blank';

const GAME_SANDBOX_MISSION: Mission = {
  id: 'sandbox-game',
  tier: 2,
  difficulty: 'medium',
  type: 'game-builder',
  gameTemplateId: 'platformer',
  title: '🎮 Sandbox — Build a Game',
  story: 'No rules. No mission. Just build the game you want to play.',
  challenge: 'Build anything you want! Pick a template and start customizing.',
  concept: 'creative freedom',
  winCondition: 'none — just build!',
  starterHint: 'Try describing your dream game and see what happens.',
  primarySkill: 'rapid-prototyping',
  xp: 0,
};

const APP_SANDBOX_MISSION: Mission = {
  id: 'sandbox-app',
  tier: 3,
  difficulty: 'medium',
  type: 'builder',
  title: '🛠️ Sandbox — Build an App',
  story: 'No rules. No mission. Build whatever you can imagine.',
  challenge: 'Describe the app you want to build and iterate until it\'s perfect.',
  concept: 'creative freedom',
  winCondition: 'none — just build!',
  starterHint: 'Start with a clear description. What does your app do? Who is it for?',
  primarySkill: 'rapid-prototyping',
  xp: 0,
};

const TOOL_SANDBOX_MISSION: Mission = {
  id: 'sandbox-tool',
  tier: 3,
  difficulty: 'easy',
  type: 'builder',
  title: '🔧 Sandbox — Build a Tool',
  story: 'Build something useful — a calculator, a converter, a timer, anything!',
  challenge: 'What tool would make your life easier? Build it!',
  concept: 'creative freedom',
  winCondition: 'none — just build!',
  starterHint: 'Think of a small problem in your daily life. Build a tool that solves it!',
  primarySkill: 'rapid-prototyping',
  xp: 0,
};

const TEMPLATES: { id: Template; emoji: string; label: string; description: string }[] = [
  { id: 'game', emoji: '🎮', label: 'Game', description: 'Build a playable game — platformer, maze, space shooter, or something new' },
  { id: 'app', emoji: '📱', label: 'App', description: 'Build a web app — productivity tool, dashboard, anything useful' },
  { id: 'tool', emoji: '🔧', label: 'Tool', description: 'Build something that solves a real problem in your life' },
  { id: 'blank', emoji: '✨', label: 'Blank Canvas', description: 'Start from scratch — complete creative freedom' },
];

export default function SandboxPage() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') ?? '';
  const [selected, setSelected] = useState<Template | null>(null);

  if (selected === 'game') {
    return <GameBuilder mission={GAME_SANDBOX_MISSION} childId={childId} tier={2} />;
  }

  if (selected === 'app') {
    return <BuilderView mission={APP_SANDBOX_MISSION} childId={childId} tier={3} />;
  }

  if (selected === 'tool') {
    return <BuilderView mission={TOOL_SANDBOX_MISSION} childId={childId} tier={3} />;
  }

  if (selected === 'blank') {
    return <BuilderView mission={{ ...APP_SANDBOX_MISSION, id: 'sandbox-blank', title: '✨ Sandbox — Blank Canvas', story: 'Start from nothing and build anything.', challenge: 'What will you create?', starterHint: 'The sky is the limit! Describe anything.' }} childId={childId} tier={3} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-purple-300 hover:text-white transition-colors text-sm">← Dashboard</Link>
        <span className="text-white/30">|</span>
        <span className="text-2xl">🎨</span>
        <span className="text-white font-bold text-xl">Sandbox</span>
      </header>

      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Build Anything</h1>
          <p className="text-purple-300 text-lg">No mission. No rules. Pure creation.</p>
          <p className="text-purple-400 text-sm mt-2">Pick a starting point and let your imagination run wild.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-white/10 rounded-2xl p-8 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{t.emoji}</div>
              <h3 className="text-white font-bold text-xl mb-2">{t.label}</h3>
              <p className="text-purple-300 text-sm">{t.description}</p>
            </button>
          ))}
        </div>

        <p className="text-purple-500 text-xs mt-8">
          Your sandbox saves automatically — come back anytime to keep building.
        </p>
      </div>
    </div>
  );
}
