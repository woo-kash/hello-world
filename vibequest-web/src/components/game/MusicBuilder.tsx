'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import LivePreview from './LivePreview';
import VictoryScreen from './VictoryScreen';
import VoiceInput from '@/components/ui/VoiceInput';
import type { Mission } from '@/lib/missions';
import { MUSIC_TEMPLATE } from '@/lib/gameTemplates';

interface Props {
  mission: Mission;
  childId: string;
  childName?: string;
  tier: 1 | 2 | 3;
}

interface MusicSettings {
  title: string;
  bpm: number;
  instruments: string[];
  melody: number[];
  bass: number[];
  drums: number[];
  arp: number[];
  voice: number[];
  lead: number[];
  pad: number[];
  perc: number[];
}

const BEATS = 16;
const ROWS = [
  { key: 'drums' as const, instKey: 'drums',  emoji: '🥁', label: 'Drums',      color: '#FF6B6B' },
  { key: 'melody' as const, instKey: 'synth', emoji: '🎹', label: 'Synth Lead', color: '#4ECDC4' },
  { key: 'bass' as const,   instKey: 'bass',  emoji: '🎸', label: 'Bass',       color: '#A855F7' },
  { key: 'arp' as const,    instKey: 'arp',   emoji: '✨', label: 'Sparkle',    color: '#FFE66D' },
  { key: 'voice' as const,  instKey: 'voice', emoji: '🎤', label: 'Voice',      color: '#FF69B4' },
  { key: 'lead' as const,   instKey: 'lead',  emoji: '🎺', label: 'Lead',       color: '#FFA500' },
  { key: 'pad' as const,    instKey: 'pad',   emoji: '🎻', label: 'Strings',    color: '#6495ED' },
  { key: 'perc' as const,   instKey: 'perc',  emoji: '🪘', label: 'Perc',       color: '#90EE90' },
];

const DEFAULT_SETTINGS: MusicSettings = {
  title: 'My Song',
  bpm: 120,
  instruments: ['drums', 'synth', 'bass', 'arp'],
  melody: [60, 62, 64, 65, 67, 65, 64, 62, 60, 60, 62, 64, 65, 67, 69, 67],
  bass:   [36, 36, 38, 36, 36, 36, 38, 38, 36, 36, 38, 36, 36, 36, 38, 38],
  drums:  [1,0,0,0, 1,0,1,0, 1,0,0,1, 1,0,1,0],
  arp:    [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1],
  voice:  [0,0,0,0, 60,0,60,0, 0,0,0,0, 62,0,62,0],
  lead:   [0,64,0,0, 67,0,64,0, 0,65,0,0, 67,0,0,0],
  pad:    [60,0,0,0, 0,0,0,0, 60,0,0,0, 0,0,0,0],
  perc:   [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
};

export default function MusicBuilder({ mission, childId, childName, tier }: Props) {
  const router = useRouter();
  const [settings, setSettings] = useState<MusicSettings>(DEFAULT_SETTINGS);
  const [currentHtml, setCurrentHtml] = useState(MUSIC_TEMPLATE.baseHtml);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');

  // Patch iframe settings
  function patchPreview(patch: Partial<MusicSettings>) {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SETTINGS_PATCH', patch }, '*');
    }
  }

  function handleBpmChange(bpm: number) {
    setSettings(s => ({ ...s, bpm }));
    patchPreview({ bpm });
  }

  function toggleInstrument(instKey: string) {
    setSettings(s => {
      const active = s.instruments.includes(instKey)
        ? s.instruments.filter(i => i !== instKey)
        : [...s.instruments, instKey];
      patchPreview({ instruments: active });
      return { ...s, instruments: active };
    });
  }

  async function handleVibeSubmit() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'music_iterate',
          currentSettings: settings,
          kidDescription: input,
          tier,
        }),
      });
      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error();

      const data = await res.json();

      // Merge new settings
      const newSettings: MusicSettings = { ...settings, ...data.settings };
      setSettings(newSettings);
      setInput('');
      setExplanation(data.explanation ?? '');
      setRounds(r => r + 1);

      // Regenerate the HTML with new settings embedded
      const newHtml = MUSIC_TEMPLATE.baseHtml.replace(
        /const SETTINGS = \{[\s\S]*?\};/,
        `const SETTINGS = ${JSON.stringify({
          ...newSettings,
          drumColor: '#FF6B6B', synthColor: '#4ECDC4', bassColor: '#A855F7', arpColor: '#FFE66D',
          voiceColor: '#FF69B4', leadColor: '#FFA500', padColor: '#6495ED', percColor: '#90EE90',
        }, null, 2)};`
      );
      setCurrentHtml(newHtml);
    } catch {
      setError('Oops! Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  async function handleShipIt() {
    if (childId) {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, missionId: mission.id, completed: true, attempts: rounds }),
      });
    }
    setShowVictory(true);
  }

  if (showVictory) {
    return (
      <VictoryScreen
        mission={mission}
        attempts={rounds}
        tier={tier}
        childId={childId}
        onNext={() => router.push('/dashboard')}
        onReplay={() => {
          setShowVictory(false);
          setSettings(DEFAULT_SETTINGS);
          setCurrentHtml(MUSIC_TEMPLATE.baseHtml);
          setRounds(0);
          setInput('');
          setExplanation('');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col vq-stars-bg" style={{ background: 'var(--vq-bg)' }}>
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center gap-4 shrink-0 z-10 relative" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <button onClick={() => router.push('/dashboard')} className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</button>
        <div className="flex-1 flex items-center gap-3">
          <span className="text-2xl">🎵</span>
          <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}>Music Builder</span>
        </div>
        {rounds >= 1 && (
          <button onClick={handleShipIt} className="px-5 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm transition-colors animate-pulse">
            🎵 Ship It!
          </button>
        )}
      </header>

      {/* Split pane */}
      <div className="flex-1 flex min-h-0 relative z-10">
        {/* Left: Controls */}
        <div className="w-80 border-r flex flex-col overflow-y-auto" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
          <div className="p-4 space-y-6">
            {/* Story */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>
              <div className="mt-3 rounded-xl p-3" style={{ background: 'var(--vq-surface)', border: '1px solid var(--vq-border)' }}>
                <p className="font-semibold text-xs" style={{ color: 'var(--vq-accent-3)' }}>Mission:</p>
                <p className="text-sm mt-1" style={{ color: 'var(--vq-text)' }}>{mission.challenge}</p>
              </div>
            </div>

            {/* Instruments */}
            <div>
              <p className="font-bold text-sm mb-3" style={{ color: 'var(--vq-text)' }}>🎼 Instruments</p>
              <div className="grid grid-cols-2 gap-2">
                {ROWS.map(row => {
                  const active = settings.instruments.includes(row.instKey);
                  return (
                    <button
                      key={row.key}
                      onClick={() => toggleInstrument(row.instKey)}
                      className="p-3 rounded-2xl border-2 transition-all text-left"
                      style={{
                        borderColor: active ? row.color : 'var(--vq-border)',
                        background: active ? row.color + '18' : 'var(--vq-bg)',
                        opacity: active ? 1 : 0.5,
                      }}
                    >
                      <span className="text-xl block mb-1">{row.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--vq-text)' }}>{row.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BPM slider */}
            <div>
              <p className="font-bold text-sm mb-2" style={{ color: 'var(--vq-text)' }}>
                ⏱️ Tempo — <span style={{ color: 'var(--vq-primary)' }}>{settings.bpm} BPM</span>
              </p>
              <input
                type="range"
                min={60}
                max={180}
                value={settings.bpm}
                onChange={e => handleBpmChange(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: 'var(--vq-primary)' }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--vq-muted)' }}>
                <span>Slow 60</span>
                <span>Fast 180</span>
              </div>
            </div>

            {/* Beat grid preview (read-only) */}
            <div>
              <p className="font-bold text-sm mb-2" style={{ color: 'var(--vq-text)' }}>🎚️ Beat pattern</p>
              <div className="space-y-1.5">
                {ROWS.map(row => {
                  const data = settings[row.key];
                  return (
                    <div key={row.key} className="flex items-center gap-1.5">
                      <span className="text-sm w-5 text-center">{row.emoji}</span>
                      <div className="flex gap-0.5 flex-1">
                        {Array.from({ length: BEATS }).map((_, i) => {
                          const on = Array.isArray(data) && data[i % data.length];
                          return (
                            <div
                              key={i}
                              className="h-4 flex-1 rounded-sm"
                              style={{ background: on ? row.color : 'var(--vq-border)' }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Vibe code section */}
            <div className="border-t pt-4" style={{ borderColor: 'var(--vq-border)' }}>
              <p className="font-bold text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--vq-primary)' }}>🎤 Vibe your music</p>
              <VoiceInput
                value={input}
                onChange={setInput}
                onSubmit={handleVibeSubmit}
                placeholder={
                  tier === 1
                    ? 'Describe your tune! e.g. "make it sound like a space adventure"'
                    : tier === 2
                    ? 'Describe the vibe, tempo, instruments... e.g. "funky bassline, fast drums"'
                    : 'Describe the musical spec in detail — key, time signature, mood, instruments...'
                }
                rows={3}
                disabled={loading}
              />
              <button
                onClick={handleVibeSubmit}
                disabled={loading || !input.trim()}
                className="mt-3 w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 text-white"
                style={{ background: 'linear-gradient(135deg, #22C55E, var(--vq-primary))' }}
              >
                {loading ? <span className="animate-pulse">🎵 Composing…</span> : '🎵 Update Music!'}
              </button>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            {/* AI explanation */}
            {explanation && (
              <div className="rounded-2xl p-4" style={{ background: 'rgba(31,179,143,0.06)', border: '1px solid rgba(31,179,143,0.25)' }}>
                <p className="text-sm" style={{ color: 'var(--vq-primary)' }}>{explanation}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
          <LivePreview code={currentHtml} childName={childName} loading={loading} className="flex-1 min-h-0" />
          <p className="text-xs mt-2 text-center shrink-0" style={{ color: 'var(--vq-primary)' }}>
            🎵 Click ▶ Play in the preview to hear your music!
          </p>
        </div>
      </div>
    </div>
  );
}
