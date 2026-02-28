'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LivePreview from './LivePreview';
import VictoryScreen from './VictoryScreen';
import type { Mission } from '@/lib/missions';

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

export default function BuilderView({ mission, childId, childName, tier }: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<BuilderMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentHtml, setCurrentHtml] = useState('');
  const [rounds, setRounds] = useState(0);
  const [showVictory, setShowVictory] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
      // Build conversation for the API (only role + content)
      const conversation = updatedMessages.map(m => ({
        role: m.role,
        content: m.role === 'assistant' ? JSON.stringify({ html: m.html, explanation: m.explanation }) : m.content,
      }));

      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'builder_iterate',
          missionId: mission.id,
          conversation,
          tier,
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

  async function handleShipIt() {
    // Save progress
    if (childId) {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childId,
          missionId: mission.id,
          completed: true,
          attempts: rounds,
        }),
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
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-blue-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center gap-4 shrink-0">
        <button onClick={() => router.push('/dashboard')} className="text-purple-300 hover:text-white transition-colors">
          ← Back
        </button>
        <div className="flex-1">
          <span className="text-white font-bold">{mission.title}</span>
          <span className="ml-3 text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500/20 text-purple-300">
            Builder
          </span>
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
        {/* Left: Conversation */}
        <div className="w-2/5 border-r border-white/10 flex flex-col">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Initial prompt */}
            {messages.length === 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="text-3xl mb-3">🏗️</div>
                <p className="text-purple-200 text-sm leading-relaxed mb-3">{mission.story}</p>
                <div className="bg-white/10 rounded-xl p-3">
                  <p className="text-yellow-300 font-semibold text-xs mb-1">Your mission:</p>
                  <p className="text-white text-sm">{mission.challenge}</p>
                </div>
                <div className="mt-3 text-purple-300 text-xs">
                  💡 <span className="italic">{mission.starterHint}</span>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-purple-600/30 border border-purple-400/30'
                    : 'bg-white/10 border border-white/10'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-white text-sm">{msg.content}</p>
                  ) : (
                    <>
                      <p className="text-white text-sm mb-2">{msg.explanation}</p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          <p className="text-purple-300 text-xs font-semibold">Try next:</p>
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
                  <p className="text-purple-300 text-sm animate-pulse">✨ Building your app...</p>
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
                placeholder={rounds === 0 ? 'Describe what you want to build...' : 'What should we change or add?'}
                rows={2}
                className="flex-1 bg-white/10 text-white placeholder-white/30 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as any);
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl transition-colors text-sm shrink-0"
              >
                {loading ? '...' : '🚀'}
              </button>
            </div>
            <p className="text-white/30 text-xs mt-1">⌘+Enter to send</p>
          </form>
        </div>

        {/* Right: Live Preview */}
        <div className="w-3/5 p-4 flex flex-col min-h-0">
          <LivePreview
            code={currentHtml}
            childName={childName}
            loading={loading}
            className="flex-1 min-h-0"
          />
        </div>
      </div>
    </div>
  );
}
