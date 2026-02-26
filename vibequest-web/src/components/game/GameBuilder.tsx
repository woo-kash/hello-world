'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LivePreview from './LivePreview';
import VictoryScreen from './VictoryScreen';
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

// ─── Tier 1: Step-by-step guided builder ────────────────────────────
interface Tier1Step {
  question: string;
  emoji: string;
  options?: { label: string; emoji: string }[];
  freeText?: boolean;
  freeTextPlaceholder?: string;
}

const TIER1_STEPS: Tier1Step[] = [
  {
    question: 'Pick your game!',
    emoji: '🎮',
    options: [
      { label: 'Platformer (jump & run!)', emoji: '🏃' },
      { label: 'Maze Runner (eat dots!)', emoji: '👻' },
      { label: 'Space Blaster (pew pew!)', emoji: '🚀' },
      { label: 'Snake (grow big!)', emoji: '🐍' },
    ],
  },
  {
    question: 'Pick your hero!',
    emoji: '🦸',
    options: [
      { label: 'Cat', emoji: '🐱' },
      { label: 'Dog', emoji: '🐶' },
      { label: 'Robot', emoji: '🤖' },
      { label: 'Ninja', emoji: '🥷' },
    ],
  },
  {
    question: 'What do you want to collect?',
    emoji: '✨',
    options: [
      { label: 'Stars', emoji: '⭐' },
      { label: 'Gems', emoji: '💎' },
      { label: 'Pizza', emoji: '🍕' },
      { label: 'Coins', emoji: '🪙' },
    ],
  },
  {
    question: 'What are the bad guys?',
    emoji: '👾',
    options: [
      { label: 'Aliens', emoji: '👾' },
      { label: 'Ghosts', emoji: '👻' },
      { label: 'Fire', emoji: '🔥' },
      { label: 'Bats', emoji: '🦇' },
    ],
  },
  {
    question: 'Describe your world! What does it look like?',
    emoji: '🌍',
    freeText: true,
    freeTextPlaceholder: 'underwater with bubbles, in space with stars, candy land with lollipops...',
  },
];

// ─── Main GameBuilder ───────────────────────────────────────────────
export default function GameBuilder({ mission, childId, childName, tier }: Props) {
  const router = useRouter();

  // Common state
  const [currentHtml, setCurrentHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');

  // Tier 1 state
  const [tier1Step, setTier1Step] = useState(0);
  const [tier1Choices, setTier1Choices] = useState<Record<number, string>>({});
  const [tier1FreeText, setTier1FreeText] = useState('');
  const [tier1Built, setTier1Built] = useState(false);

  // Tier 2-3 state
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [messages, setMessages] = useState<BuilderMessage[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Build game from Tier 1 choices ────────────────────────────────
  async function buildTier1Game() {
    setLoading(true);
    setError('');
    try {
      const gameType = tier1Choices[0] || 'Platformer';
      const hero = tier1Choices[1] || '🐱';
      const collect = tier1Choices[2] || '⭐';
      const enemy = tier1Choices[3] || '👾';
      const world = tier1FreeText || 'a colorful world';

      // Map game type to template
      let templateId = 'platformer';
      if (gameType.includes('Maze')) templateId = 'maze';
      if (gameType.includes('Space')) templateId = 'space-blaster';
      if (gameType.includes('Snake')) templateId = 'snake';

      const template = getGameTemplate(templateId);
      const conversation = [{
        role: 'user' as const,
        content: `I want to customize this ${templateId} game. Here's what I want:
- My player character should be: ${hero}
- I want to collect: ${collect}
- The enemies/obstacles should be: ${enemy}
- The world/theme should be: ${world}

The base game template is provided. Please modify the SETTINGS object and any visual elements to match my choices. Keep all the game mechanics working perfectly. Make the theme colorful and fun!

Here is the base template to modify:
${template?.baseHtml || ''}`,
      }];

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'game_builder',
          conversation,
          tier,
          templateId,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();

      setCurrentHtml(data.html);
      setRounds(1);
      setTier1Built(true);

      // Store as messages for further iteration
      setMessages([
        { role: 'user', content: `Made a ${gameType} with ${hero} hero, collecting ${collect}, fighting ${enemy}, in ${world}` },
        { role: 'assistant', content: data.explanation, html: data.html, explanation: data.explanation, suggestions: data.suggestions },
      ]);
    } catch {
      setError('Oops! Something went wrong building your game. Try again!');
    } finally {
      setLoading(false);
    }
  }

  // ─── Tier 2-3: Pick template ──────────────────────────────────────
  function selectTemplate(templateId: string) {
    setSelectedTemplate(templateId);
    const template = getGameTemplate(templateId);
    if (template) {
      setCurrentHtml(template.baseHtml);
    }
  }

  // ─── Iterate on game ──────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: BuilderMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const template = selectedTemplate ? getGameTemplate(selectedTemplate) : null;

      // Build conversation for API
      const conversation = updatedMessages.map(m => ({
        role: m.role,
        content: m.role === 'assistant'
          ? JSON.stringify({ html: m.html, explanation: m.explanation })
          : m.content,
      }));

      // Add template context on first message
      if (updatedMessages.filter(m => m.role === 'user').length === 1 && template) {
        conversation[0].content = `I want to customize this ${template.name} game. Here's what I want:\n${input}\n\nBase template:\n${template.baseHtml}`;
      }

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'game_builder',
          conversation,
          tier,
          templateId: selectedTemplate,
        }),
      });

      if (res.status === 402) {
        router.push('/pricing?locked=true');
        return;
      }
      if (!res.ok) throw new Error('AI request failed');

      const data = await res.json();
      const assistantMessage: BuilderMessage = {
        role: 'assistant',
        content: data.explanation,
        html: data.html,
        explanation: data.explanation,
        suggestions: data.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentHtml(data.html);
      setRounds(prev => prev + 1);
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
          setTier1Step(0);
          setTier1Choices({});
          setTier1Built(false);
          setSelectedTemplate(null);
        }}
      />
    );
  }

  // ─── Tier 1: Step-by-step guided UI ───────────────────────────────
  if (tier === 1 && !tier1Built) {
    const step = TIER1_STEPS[tier1Step];
    const isLast = tier1Step >= TIER1_STEPS.length - 1;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 flex flex-col">
        <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-purple-300 hover:text-white transition-colors">← Back</button>
          <span className="text-white font-bold flex-1">{mission.title}</span>
          <span className="text-purple-400 text-sm">Step {tier1Step + 1}/{TIER1_STEPS.length}</span>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-lg w-full">
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-8">
              {TIER1_STEPS.map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full transition-all ${
                  i < tier1Step ? 'bg-green-400' : i === tier1Step ? 'bg-purple-400 scale-125' : 'bg-white/20'
                }`} />
              ))}
            </div>

            {/* Question */}
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block animate-idle-bob">{step.emoji}</span>
              <h2 className="text-white text-2xl font-bold">{step.question}</h2>
            </div>

            {/* Options */}
            {step.options && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {step.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setTier1Choices(prev => ({ ...prev, [tier1Step]: `${opt.emoji} ${opt.label}` }));
                      if (!isLast) {
                        setTimeout(() => setTier1Step(prev => prev + 1), 300);
                      }
                    }}
                    className={`p-5 rounded-2xl border-2 transition-all text-left ${
                      tier1Choices[tier1Step]?.includes(opt.label)
                        ? 'border-purple-400 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-3xl block mb-2">{opt.emoji}</span>
                    <span className="text-white font-semibold text-sm">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Free text */}
            {step.freeText && (
              <div className="space-y-4">
                <textarea
                  value={tier1FreeText}
                  onChange={e => setTier1FreeText(e.target.value)}
                  placeholder={step.freeTextPlaceholder}
                  rows={3}
                  className="w-full bg-white/10 text-white placeholder-white/30 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                />
                <button
                  onClick={buildTier1Game}
                  disabled={loading || !tier1FreeText.trim()}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-gray-900 font-bold rounded-xl text-lg transition-colors"
                >
                  {loading ? (
                    <span className="animate-pulse">✨ Building your game...</span>
                  ) : (
                    '🎮 Build My Game!'
                  )}
                </button>
              </div>
            )}

            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

            {/* Back button */}
            {tier1Step > 0 && (
              <button
                onClick={() => setTier1Step(prev => prev - 1)}
                className="mt-4 text-purple-300 text-sm hover:text-white transition-colors mx-auto block"
              >
                ← Go back
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Template selection (Tier 2-3, before building) ───────────────
  if (tier >= 2 && !selectedTemplate && rounds === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 flex flex-col">
        <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-purple-300 hover:text-white transition-colors">← Back</button>
          <span className="text-white font-bold flex-1">{mission.title}</span>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <span className="text-6xl mb-4 block animate-idle-bob">🎮</span>
              <h2 className="text-white text-3xl font-bold mb-2">Pick Your Game</h2>
              <p className="text-purple-300">Choose a game template, then vibe code it into YOUR game</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {GAME_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template.id)}
                  className="p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-white/10 transition-all text-left group"
                >
                  <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">{template.emoji}</span>
                  <h3 className="text-white font-bold text-lg mb-1">{template.name}</h3>
                  <p className="text-purple-300 text-sm mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.customizableAreas.slice(0, 4).map(area => (
                      <span key={area} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">{area}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Builder UI (Tier 1 after build, or Tier 2-3 after template) ─
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-purple-300 hover:text-white transition-colors">← Back</button>
        <div className="flex-1">
          <span className="text-white font-bold">{mission.title}</span>
          <span className="ml-3 text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-500/20 text-yellow-300">🎮 Game Builder</span>
        </div>
        <span className="text-purple-400 text-sm">{rounds} round{rounds !== 1 ? 's' : ''}</span>
        {rounds >= 3 && (
          <button
            onClick={handleShipIt}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl text-sm transition-colors animate-pulse"
          >
            🚀 Ship It!
          </button>
        )}
      </header>

      {/* Main area */}
      <div className="flex-1 flex min-h-0">
        {/* Left: Chat */}
        <div className="w-2/5 border-r border-white/10 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Initial context */}
            {messages.length === 0 && selectedTemplate && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="text-3xl mb-3">🎮</div>
                <p className="text-purple-200 text-sm leading-relaxed mb-3">
                  You picked <strong>{getGameTemplate(selectedTemplate)?.name}</strong>! The base game is loaded on the right.
                </p>
                <p className="text-yellow-300 font-semibold text-sm mb-2">Now make it YOUR game!</p>
                <p className="text-white/70 text-sm">Describe what you want to change — the character, enemies, theme, power-ups, anything!</p>
                <div className="mt-3 space-y-1">
                  {getGameTemplate(selectedTemplate)?.customizableAreas.map(area => (
                    <span key={area} className="inline-block text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full mr-1 mb-1">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user' ? 'bg-purple-600/30 border border-purple-400/30' : 'bg-white/10 border border-white/10'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-white text-sm">{msg.content}</p>
                  ) : (
                    <>
                      <p className="text-white text-sm mb-2">{msg.explanation}</p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-yellow-300 text-xs font-semibold">Try next:</p>
                          {msg.suggestions.map((s, j) => (
                            <button
                              key={j}
                              onClick={() => !loading && setInput(s)}
                              className="block w-full text-left text-xs text-purple-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors"
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
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-purple-300 text-sm animate-pulse">🎮 Updating your game...</p>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 shrink-0">
            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={rounds === 0 ? 'Describe your dream game...' : 'What should we change or add?'}
                rows={2}
                className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as any);
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 text-gray-900 font-bold rounded-xl transition-colors text-sm shrink-0"
              >
                {loading ? '...' : '🎮'}
              </button>
            </div>
            <p className="text-white/30 text-xs mt-1">⌘+Enter to send</p>
          </form>
        </div>

        {/* Right: Live Preview (playable game) */}
        <div className="w-3/5 p-4 flex flex-col">
          <LivePreview
            code={currentHtml}
            childName={childName}
            loading={loading}
          />
          <div className="mt-2 text-center">
            <p className="text-purple-300 text-xs">
              🎮 Use arrow keys / WASD to play! {tier >= 2 ? 'Space to shoot/jump.' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
