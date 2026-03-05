'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GameBuilder from '@/components/game/GameBuilder';
import MusicBuilder from '@/components/game/MusicBuilder';
import type { Mission } from '@/lib/missions';

type Template = 'game' | 'music' | 'app';

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

const MUSIC_SANDBOX_MISSION: Mission = {
  id: 'sandbox-music',
  tier: 2,
  difficulty: 'medium',
  type: 'music',
  title: '🎵 Sandbox — Music Studio',
  story: 'No rules. No mission. Just make music.',
  challenge: 'Describe the music you want to create. Change the tempo, instruments, and mood!',
  concept: 'creative freedom',
  winCondition: 'none — just create!',
  starterHint: 'Describe a mood or genre: "A chill lo-fi beat with soft drums and a dreamy synth melody"',
  primarySkill: 'precision-of-language',
  xp: 0,
};

const APP_SANDBOX_MISSION: Mission = {
  id: 'sandbox-app',
  tier: 2,
  difficulty: 'medium',
  type: 'game-builder',
  gameTemplateId: 'platformer',
  title: '🛠️ Sandbox — Build an App',
  story: 'No rules. No mission. Build whatever you can imagine.',
  challenge: 'Describe the app you want to build and iterate until it\'s perfect.',
  concept: 'creative freedom',
  winCondition: 'none — just build!',
  starterHint: 'Start with a clear description. What does your app do? Who is it for?',
  primarySkill: 'rapid-prototyping',
  xp: 0,
};

const TEMPLATES: { id: Template; emoji: string; label: string; description: string }[] = [
  { id: 'game', emoji: '🎮', label: 'Game', description: 'Build a playable game — platformer, maze, space shooter, or something new' },
  { id: 'music', emoji: '🎵', label: 'Music', description: 'Compose a beat — describe the vibe and the AI builds it' },
  { id: 'app', emoji: '🛠️', label: 'App', description: 'Build a web app — study tool, quiz, dashboard, anything' },
];

export default function SandboxPage() {
  const searchParams = useSearchParams();
  const childId = searchParams.get('childId') ?? '';
  const [selected, setSelected] = useState<Template | null>(null);

  if (selected === 'game') {
    return <GameBuilder mission={GAME_SANDBOX_MISSION} childId={childId} tier={2} />;
  }

  if (selected === 'music') {
    return <MusicBuilder mission={MUSIC_SANDBOX_MISSION} childId={childId} tier={2} />;
  }

  if (selected === 'app') {
    return <GameBuilder mission={APP_SANDBOX_MISSION} childId={childId} tier={2} />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-4 flex items-center gap-3" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/dashboard" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Dashboard</Link>
        <span style={{ color: 'var(--vq-border)' }}>|</span>
        <span className="text-2xl">🎨</span>
        <span className="font-bold text-xl" style={{ color: 'var(--vq-text)' }}>Sandbox</span>
      </header>

      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--vq-text)' }}>Build Anything</h1>
          <p className="text-lg" style={{ color: 'var(--vq-muted)' }}>No mission. No rules. Pure creation.</p>
          <p className="text-sm mt-2" style={{ color: 'var(--vq-muted)' }}>Pick a starting point and let your imagination run wild.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="rounded-2xl p-8 text-left transition-all hover:scale-[1.02] group"
              style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{t.emoji}</div>
              <h3 className="font-bold text-xl mb-2" style={{ color: 'var(--vq-text)' }}>{t.label}</h3>
              <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>{t.description}</p>
            </button>
          ))}
        </div>

        <p className="text-xs mt-8" style={{ color: 'var(--vq-muted)' }}>
          Your sandbox saves automatically — come back anytime to keep building.
        </p>
      </div>
    </div>
  );
}
