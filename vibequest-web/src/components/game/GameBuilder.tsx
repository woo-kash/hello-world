'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LivePreview from './LivePreview';
import VictoryScreen from './VictoryScreen';
import VoiceInput from '@/components/ui/VoiceInput';
import type { Mission } from '@/lib/missions';
import { GAME_TEMPLATES, getGameTemplate } from '@/lib/gameTemplates';

interface BuilderMessage {
  role: 'user' | 'assistant';
  content: string;
  html?: string;
  explanation?: string;
  suggestions?: string[];
}

interface Props {
  mission: Mission;
  childId: string;
  childName?: string;
  tier: 1 | 2 | 3;
}

// ─── Tier 1 hybrid: character options ─────────────────────────────
const CHARACTER_OPTIONS = [
  '🐱','🐶','🤖','🥷','🐸','🦊','🐼','🐯',
  '🦄','👽','🐲','🧙',
];

const BG_COLOURS = [
  { label: 'Space Navy', value: '#0D0B1F' },
  { label: 'Forest', value: '#1a2e1a' },
  { label: 'Lava', value: '#2e1a1a' },
  { label: 'Ocean', value: '#0a1a2e' },
  { label: 'Candy', value: '#2e1a2e' },
  { label: 'Desert', value: '#2e2a1a' },
  { label: 'Ice', value: '#1a2a2e' },
  { label: 'Dawn', value: '#2e1a2a' },
];

const PLATFORM_COLOURS = [
  { label: 'Green', value: '#2ecc71' },
  { label: 'Purple', value: '#9b59b6' },
  { label: 'Gold', value: '#f39c12' },
  { label: 'Teal', value: '#1abc9c' },
  { label: 'Red', value: '#e74c3c' },
  { label: 'Blue', value: '#3498db' },
  { label: 'Pink', value: '#e91e8c' },
  { label: 'White', value: '#ecf0f1' },
];

const FEATURE_TOGGLES = [
  { id: 'powerups', label: 'Power-ups', emoji: '⚡' },
  { id: 'extraLives', label: 'Extra lives', emoji: '❤️' },
  { id: 'timer', label: 'Timer', emoji: '⏱️' },
  { id: 'speedBoost', label: 'Speed boost', emoji: '🚀' },
  { id: 'bossEnemy', label: 'Boss enemy', emoji: '👹' },
];

// ─── Main GameBuilder ──────────────────────────────────────────────
export default function GameBuilder({ mission, childId, childName, tier }: Props) {
  const router = useRouter();

  // Common state
  const [currentHtml, setCurrentHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');
  const [input, setInput] = useState('');

  // Tier 1 hybrid builder state
  const [selectedChar, setSelectedChar] = useState('🐱');
  const [selectedBg, setSelectedBg] = useState(BG_COLOURS[0].value);
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORM_COLOURS[0].value);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [tier1GameType, setTier1GameType] = useState('platformer');
  const [tier1Started, setTier1Started] = useState(false);

  // Tier 2-3 state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [messages, setMessages] = useState<BuilderMessage[]>([]);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Patch game SETTINGS via postMessage ──────────────────────────
  function patchSettings(patch: Record<string, unknown>) {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'SETTINGS_PATCH', patch }, '*');
    }
  }

  // ─── Tier 1: Load base template on game type change ───────────────
  function loadBaseTemplate(templateId: string) {
    const template = getGameTemplate(templateId);
    if (template) {
      setCurrentHtml(template.baseHtml);
      setTier1GameType(templateId);
      setTier1Started(true);
    }
  }

  // Apply character/colour instantly via postMessage
  function applyChar(emoji: string) {
    setSelectedChar(emoji);
    patchSettings({ playerEmoji: emoji, headEmoji: emoji, birdEmoji: emoji, shipEmoji: emoji });
  }

  function applyBg(color: string) {
    setSelectedBg(color);
    patchSettings({ bgColor: color, bgColor1: color, bgColor2: color });
  }

  function applyPlatform(color: string) {
    setSelectedPlatform(color);
    patchSettings({ platformColor: color, wallColor: color });
  }

  function toggleFeature(id: string) {
    setFeatures(prev => ({ ...prev, [id]: !prev[id] }));
    // Features affect AI description, not direct SETTINGS — bundled on vibe submit
  }

  // ─── Build from Tier 1 vibe prompt ────────────────────────────────
  async function buildTier1Game() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');

    const enabledFeatures = FEATURE_TOGGLES.filter(f => features[f.id]).map(f => f.label);
    const featureDesc = enabledFeatures.length ? `\nExtra features: ${enabledFeatures.join(', ')}` : '';

    const template = getGameTemplate(tier1GameType);
    const conversation = [{
      role: 'user' as const,
      content: `Customize this ${tier1GameType} game with my vision:
- Player character: ${selectedChar}
- Background color: ${selectedBg}
- Platform/wall color: ${selectedPlatform}${featureDesc}
- My world description: ${input}

Apply these settings to the SETTINGS object. Keep all game mechanics working.

Base template:
${template?.baseHtml ?? ''}`,
    }];

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'game_builder', conversation, tier, templateId: tier1GameType }),
      });
      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCurrentHtml(data.html);
      setRounds(r => r + 1);
      setMessages([
        { role: 'user', content: `${selectedChar} game in ${input}` },
        { role: 'assistant', content: data.explanation, html: data.html, suggestions: data.suggestions },
      ]);
      setInput('');
    } catch {
      setError('Oops! Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  // ─── Tier 2-3: Pick template ──────────────────────────────────────
  function selectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    const template = getGameTemplate(templateId);
    if (template) setCurrentHtml(template.baseHtml);
  }

  // ─── Iterate (Tier 2-3 chat) ──────────────────────────────────────
  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: BuilderMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const template = selectedTemplate ? getGameTemplate(selectedTemplate) : null;
      const conversation = updatedMessages.map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? JSON.stringify({ html: m.html, explanation: m.explanation }) : m.content,
      }));
      if (updatedMessages.filter(m => m.role === 'user').length === 1 && template) {
        conversation[0].content = `I want to customize this ${template.name} game:\n${input}\n\nBase template:\n${template.baseHtml}`;
      }

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'game_builder', conversation, tier, templateId: selectedTemplate }),
      });
      if (res.status === 402) { router.push('/pricing?locked=true'); return; }
      if (!res.ok) throw new Error();

      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant', content: data.explanation, html: data.html, explanation: data.explanation, suggestions: data.suggestions,
      }]);
      setCurrentHtml(data.html);
      setRounds(r => r + 1);
    } catch {
      setError('Oops! Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  // ─── Ship It ──────────────────────────────────────────────────────
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
          setMessages([]);
          setCurrentHtml('');
          setRounds(0);
          setTier1Started(false);
          setSelectedTemplate(null);
          setInput('');
        }}
      />
    );
  }

  // ─── Template selection (Tier 2-3, before building) ───────────────
  if (tier >= 2 && !selectedTemplate) {
    return (
      <div className="min-h-screen vq-stars-bg flex flex-col" style={{ background: 'var(--vq-bg)' }}>
        <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
          <button onClick={() => router.push('/dashboard')} className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</button>
          <span className="font-bold flex-1" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
        </header>
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-10">
              <span className="text-6xl mb-4 block animate-idle-bob">🎮</span>
              <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--vq-text)' }}>Pick Your Game</h2>
              <p style={{ color: 'var(--vq-muted)' }}>Choose a template, then vibe code it into YOUR game</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GAME_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => selectTemplate(t.id)}
                  className="p-6 rounded-3xl border-2 hover:scale-105 transition-all text-left group"
                  style={{ background: 'var(--vq-card)', borderColor: 'var(--vq-border)' }}
                >
                  <span className="text-5xl block mb-3 group-hover:scale-110 transition-transform">{t.emoji}</span>
                  <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--vq-text)' }}>{t.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Tier 1: Hybrid builder ────────────────────────────────────────
  if (tier === 1) {
    return (
      <div className="min-h-screen flex flex-col vq-stars-bg" style={{ background: 'var(--vq-bg)' }}>
        {/* Header */}
        <header className="border-b px-6 py-3 flex items-center gap-4 shrink-0 z-10 relative" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
          <button onClick={() => router.push('/dashboard')} className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</button>
          <div className="flex-1 flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
          </div>
          {rounds >= 1 && (
            <button onClick={handleShipIt} className="px-5 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm transition-colors animate-pulse">
              🚀 Ship It!
            </button>
          )}
        </header>

        {/* Split pane */}
        <div className="flex-1 flex min-h-0 relative z-10">
          {/* Left: Controls */}
          <div className="w-80 border-r flex flex-col overflow-y-auto" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
            <div className="p-4 space-y-6">
              {/* Game type picker */}
              <div>
                <p className="font-bold text-sm mb-3" style={{ color: 'var(--vq-text)' }}>🎮 Pick your game</p>
                <div className="grid grid-cols-2 gap-2">
                  {GAME_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => loadBaseTemplate(t.id)}
                      className="p-3 rounded-2xl border-2 transition-all text-left"
                      style={{
                        borderColor: (tier1GameType === t.id && tier1Started) ? 'var(--vq-primary)' : 'var(--vq-border)',
                        background: (tier1GameType === t.id && tier1Started) ? 'rgba(31,179,143,0.08)' : 'var(--vq-bg)',
                      }}
                    >
                      <span className="text-2xl block mb-1">{t.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--vq-text)' }}>{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section A: Pick & Click */}
              <div className="border-t pt-4" style={{ borderColor: 'var(--vq-border)' }}>
                <p className="font-bold text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--vq-accent-3)' }}>A — Pick & Click (instant)</p>

                {/* Character picker */}
                <p className="text-xs mb-2" style={{ color: 'var(--vq-muted)' }}>Hero character</p>
                <div className="grid grid-cols-6 gap-1 mb-4">
                  {CHARACTER_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => applyChar(c)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all hover:scale-110"
                      style={{
                        background: selectedChar === c ? 'rgba(31,179,143,0.15)' : 'var(--vq-bg)',
                        border: selectedChar === c ? '2px solid var(--vq-primary)' : '1px solid var(--vq-border)',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {/* Background colour */}
                <p className="text-xs mb-2" style={{ color: 'var(--vq-muted)' }}>Background colour</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {BG_COLOURS.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => applyBg(c.value)}
                      className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                      style={{ background: c.value, borderColor: selectedBg === c.value ? 'var(--vq-text)' : 'transparent' }}
                    />
                  ))}
                </div>

                {/* Platform / wall colour */}
                <p className="text-xs mb-2" style={{ color: 'var(--vq-muted)' }}>Platform / wall colour</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {PLATFORM_COLOURS.map(c => (
                    <button
                      key={c.value}
                      title={c.label}
                      onClick={() => applyPlatform(c.value)}
                      className="w-9 h-9 rounded-full border-2 transition-all hover:scale-110"
                      style={{ background: c.value, borderColor: selectedPlatform === c.value ? 'var(--vq-text)' : 'transparent' }}
                    />
                  ))}
                </div>

                {/* Feature toggles */}
                <p className="text-xs mb-2" style={{ color: 'var(--vq-muted)' }}>Features</p>
                <div className="space-y-1.5">
                  {FEATURE_TOGGLES.map(f => (
                    <label key={f.id} className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => toggleFeature(f.id)}
                        className="w-10 h-5 rounded-full transition-all relative cursor-pointer"
                        style={{ background: features[f.id] ? 'var(--vq-primary)' : 'var(--vq-border)' }}
                      >
                        <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: features[f.id] ? '1.25rem' : '0.125rem' }} />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--vq-muted)' }}>{f.emoji} {f.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section B: Vibe Code */}
              <div className="border-t pt-4" style={{ borderColor: 'var(--vq-border)' }}>
                <p className="font-bold text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--vq-primary)' }}>B — Vibe Code (AI magic)</p>
                <VoiceInput
                  value={input}
                  onChange={setInput}
                  onSubmit={buildTier1Game}
                  placeholder="Describe your world... underwater with bubbles, candy land, haunted forest..."
                  rows={3}
                  disabled={loading || !tier1Started}
                />
                <button
                  onClick={buildTier1Game}
                  disabled={loading || !input.trim() || !tier1Started}
                  className="mt-3 w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 text-white"
                  style={{ background: 'linear-gradient(135deg, var(--vq-accent-1), var(--vq-purple))' }}
                >
                  {loading ? <span className="animate-pulse">✨ Building…</span> : '🎮 Build My Game!'}
                </button>
                {!tier1Started && (
                  <p className="text-xs mt-2 text-center" style={{ color: 'var(--vq-muted)' }}>← Pick a game type first</p>
                )}
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              {/* AI suggestions */}
              {messages.length > 0 && messages[messages.length - 1].suggestions && (
                <div className="border-t pt-4" style={{ borderColor: 'var(--vq-border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--vq-accent-3)' }}>💡 Try next:</p>
                  {messages[messages.length - 1].suggestions!.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(s); }}
                      className="block w-full text-left text-xs rounded-xl px-3 py-2 mb-1.5 transition-colors hover:bg-[var(--vq-border)]"
                      style={{ color: 'var(--vq-muted)', background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Live preview */}
          <div className="flex-1 p-4 flex flex-col min-h-0">
            {!tier1Started ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center" style={{ color: 'var(--vq-muted)' }}>
                  <p className="text-5xl mb-4">🎮</p>
                  <p className="text-lg font-semibold">Pick a game type to start!</p>
                  <p className="text-sm mt-2">Then choose your character and colours</p>
                </div>
              </div>
            ) : (
              <LivePreview code={currentHtml} childName={childName} loading={loading} className="flex-1 min-h-0" />
            )}
            {tier1Started && (
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--vq-muted)' }}>
                🎮 Arrow keys / WASD to play · Character & colours update instantly!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Tier 2-3: Chat builder ────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col vq-stars-bg" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center gap-4 shrink-0 z-10 relative" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <button onClick={() => router.push('/dashboard')} className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Back</button>
        <div className="flex-1">
          <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
          <span className="ml-3 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(255,209,102,0.15)', color: '#A0780A' }}>🎮 Game Builder</span>
        </div>
        <span className="text-sm" style={{ color: 'var(--vq-muted)' }}>{rounds} round{rounds !== 1 ? 's' : ''}</span>
        {rounds >= 3 && (
          <button onClick={handleShipIt} className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl text-sm transition-colors animate-pulse">
            🚀 Ship It!
          </button>
        )}
      </header>

      <div className="flex-1 flex min-h-0 relative z-10">
        {/* Left: Chat */}
        <div className="w-2/5 border-r flex flex-col" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && selectedTemplate && (
              <div className="rounded-2xl p-5" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
                <div className="text-3xl mb-3">🎮</div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--vq-muted)' }}>
                  You picked <strong style={{ color: 'var(--vq-text)' }}>{getGameTemplate(selectedTemplate)?.name}</strong>! The base game is loaded.
                </p>
                <p className="font-semibold text-sm" style={{ color: 'var(--vq-primary)' }}>Now make it YOUR game!</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] rounded-2xl p-4" style={{
                  background: msg.role === 'user' ? 'rgba(31,179,143,0.1)' : 'var(--vq-bg)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(31,179,143,0.25)' : 'var(--vq-border)'}`,
                }}>
                  {msg.role === 'user' ? (
                    <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{msg.content}</p>
                  ) : (
                    <>
                      <p className="text-sm mb-2" style={{ color: 'var(--vq-text)' }}>{msg.explanation}</p>
                      {msg.suggestions && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-xs font-semibold" style={{ color: 'var(--vq-accent-3)' }}>Try next:</p>
                          {msg.suggestions.map((s, j) => (
                            <button
                              key={j}
                              onClick={() => !loading && setInput(s)}
                              className="block w-full text-left text-xs rounded-lg px-3 py-2 transition-colors hover:bg-[var(--vq-border)]"
                              style={{ color: 'var(--vq-muted)', background: 'var(--vq-surface)', border: '1px solid var(--vq-border)' }}
                            >
                              💡 {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl p-4" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
                  <p className="text-sm animate-pulse" style={{ color: 'var(--vq-primary)' }}>🎮 Updating your game…</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t shrink-0 space-y-2" style={{ borderColor: 'var(--vq-border)' }}>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <VoiceInput
              value={input}
              onChange={setInput}
              onSubmit={() => handleSubmit()}
              placeholder={rounds === 0 ? 'Describe your dream game…' : 'What should we change or add?'}
              rows={2}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 text-white"
              style={{ background: 'linear-gradient(135deg, var(--vq-accent-3), var(--vq-accent-1))' }}
            >
              {loading ? '…' : '🎮 Update Game'}
            </button>
            <p className="text-xs text-center" style={{ color: 'var(--vq-muted)' }}>⌘+Enter to send · 🎤 to speak</p>
          </form>
        </div>

        {/* Right: Live preview */}
        <div className="flex-1 p-4 flex flex-col min-h-0">
          <LivePreview code={currentHtml} childName={childName} loading={loading} className="flex-1 min-h-0" />
          <p className="text-xs mt-2 text-center shrink-0" style={{ color: 'var(--vq-muted)' }}>
            🎮 Arrow keys / WASD to play{tier >= 2 ? ' · Space to shoot/jump' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
