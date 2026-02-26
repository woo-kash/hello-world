'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { AvatarDisplay } from '@/components/ui/AvatarDisplay';

const AVATAR_GROUPS = [
  { label: 'Kids',    avatars: ['🧒', '👧', '👦', '🧒‍♀️', '🧑', '👦🏽', '👧🏽', '🧑‍🦱'] },
  { label: 'Heroes',  avatars: ['🦸', '🦸‍♀️', '🧙', '🧙‍♀️', '🥷', '🦊', '🐱', '🐺'] },
  { label: 'Space',   avatars: ['🚀', '👾', '🤖', '👽', '🛸', '⭐', '🌙', '☄️'] },
  { label: 'Animals', avatars: ['🦁', '🐯', '🐼', '🐉', '🦋', '🦄', '🐸', '🦅'] },
  { label: 'Cool',    avatars: ['😎', '🤓', '🎮', '🎨', '🎵', '🔥', '⚡', '💎'] },
];

const TIERS = [
  { num: 1, emoji: '🌟', label: 'Explorers',    age: 'Ages 6–8',   color: 'var(--vq-accent-1)', defaultAge: '7',  desc: 'Plain English instructions & fun missions' },
  { num: 2, emoji: '🗺️',  label: 'Adventurers',  age: 'Ages 9–12',  color: 'var(--vq-primary)',  defaultAge: '10', desc: 'Logic, loops & building real mini-apps' },
  { num: 3, emoji: '💻', label: 'Vibe Coders',  age: 'Ages 13–16', color: 'var(--vq-purple)',   defaultAge: '14', desc: 'AI-powered coding, APIs & full projects' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'child'>('welcome');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [avatarTab, setAvatarTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // AI avatar state
  const [aiDescription, setAiDescription] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAvatar, setAiAvatar] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const tier = parseInt(age) <= 8 ? 1 : parseInt(age) <= 12 ? 2 : 3;
  const tierInfo = TIERS[tier - 1];

  function handleTierClick(t: typeof TIERS[number]) {
    setAge(t.defaultAge);
    setStep('child');
  }

  function handlePhotoUpload(file: File) {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) setAvatar(e.target.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerateAvatar() {
    if (!aiDescription.trim()) return;
    setAiGenerating(true);
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_avatar', description: aiDescription }),
      });
      const data = await res.json();
      if (data.svg) setAiAvatar(data.svg);
    } catch {
      // silent fail
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !age) return;

    setLoading(true);
    setError('');

    const res = await fetch('/api/child-profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, age: parseInt(age), avatar }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    router.push('/dashboard');
  }

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--vq-bg)' }}>
        <div className="max-w-2xl w-full text-center">
          <div className="text-7xl mb-4">✨</div>
          <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--vq-text)' }}>Welcome to VibeQuest!</h1>
          <p className="text-lg mb-10" style={{ color: 'var(--vq-muted)' }}>
            Pick your child&apos;s tier to get started. You can change it anytime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {TIERS.map(t => (
              <button
                key={t.num}
                onClick={() => handleTierClick(t)}
                className="rounded-3xl p-6 text-left transition-all hover:scale-[1.03] hover:shadow-lg group"
                style={{
                  background: 'var(--vq-card)',
                  border: `2px solid var(--vq-border)`,
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = t.color)}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--vq-border)')}
              >
                <div className="text-4xl mb-3">{t.emoji}</div>
                <div className="font-bold text-lg mb-1" style={{ color: 'var(--vq-text)' }}>{t.label}</div>
                <div className="text-sm font-medium mb-2" style={{ color: t.color }}>{t.age}</div>
                <div className="text-xs" style={{ color: 'var(--vq-muted)' }}>{t.desc}</div>
                <div className="mt-4 text-sm font-semibold" style={{ color: t.color }}>
                  Choose →
                </div>
              </button>
            ))}
          </div>

          <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>
            Don&apos;t worry — the right tier is chosen automatically based on your child&apos;s age.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--vq-bg)' }}>
      <div className="max-w-lg w-full">
        {/* Back button */}
        <button
          onClick={() => setStep('welcome')}
          className="mb-6 text-sm transition-colors"
          style={{ color: 'var(--vq-primary)' }}
        >
          ← Back
        </button>

        {/* Avatar preview */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center rounded-full mb-3"
            style={{
              width: 80, height: 80,
              background: 'var(--vq-surface)',
              border: '3px solid var(--vq-primary)',
            }}
          >
            <AvatarDisplay avatar={avatar} size={56} />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: 'var(--vq-text)' }}>Create Profile</h2>
          {age && (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full px-4 py-1" style={{ background: 'rgba(31,179,143,0.1)', border: '1px solid rgba(31,179,143,0.25)' }}>
              <span>{tierInfo.emoji}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--vq-primary)' }}>
                {tierInfo.label} ({tierInfo.age})
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl p-8 space-y-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>

          {/* Avatar picker — tabs */}
          <div>
            <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--vq-muted)' }}>Pick an avatar</label>

            {/* Tab row */}
            <div className="flex gap-1 mb-3 flex-wrap">
              {AVATAR_GROUPS.map((g, i) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setAvatarTab(i)}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: avatarTab === i ? 'var(--vq-primary)' : 'var(--vq-bg)',
                    color: avatarTab === i ? 'white' : 'var(--vq-muted)',
                    border: '1px solid var(--vq-border)',
                  }}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Emoji grid */}
            <div className="grid grid-cols-8 gap-1.5">
              {AVATAR_GROUPS[avatarTab].avatars.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className="text-2xl rounded-xl transition-all flex items-center justify-center"
                  style={{
                    height: 44,
                    background: avatar === a ? 'rgba(31,179,143,0.15)' : 'var(--vq-bg)',
                    border: avatar === a ? '2px solid var(--vq-primary)' : '2px solid transparent',
                    transform: avatar === a ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Photo upload */}
            <div className="mt-3 flex gap-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); }}
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-colors"
                style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)', color: 'var(--vq-muted)' }}
              >
                📷 Upload photo
              </button>
            </div>

            {/* AI avatar generator */}
            <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(124,77,255,0.06)', border: '1px solid rgba(124,77,255,0.2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--vq-purple)' }}>✨ Vibe it! — AI avatar</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={aiDescription}
                  onChange={e => setAiDescription(e.target.value)}
                  placeholder="e.g. a brave fox astronaut"
                  className="flex-1 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2"
                  style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)', color: 'var(--vq-text)', '--tw-ring-color': 'var(--vq-purple)' } as React.CSSProperties}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleGenerateAvatar(); } }}
                />
                <button
                  type="button"
                  onClick={handleGenerateAvatar}
                  disabled={aiGenerating || !aiDescription.trim()}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ background: 'var(--vq-purple)' }}
                >
                  {aiGenerating ? '...' : 'Generate'}
                </button>
              </div>
              {aiAvatar && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-full overflow-hidden" style={{ width: 48, height: 48, border: '2px solid var(--vq-purple)' }}>
                    <AvatarDisplay avatar={aiAvatar} size={48} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAvatar(aiAvatar)}
                    className="text-xs font-semibold px-3 py-1 rounded-full text-white"
                    style={{ background: 'var(--vq-purple)' }}
                  >
                    Use this!
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--vq-muted)' }}>Child&apos;s name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--vq-bg)',
                border: '1px solid var(--vq-border)',
                color: 'var(--vq-text)',
              }}
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--vq-muted)' }}>Child&apos;s age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 9"
              min="4"
              max="17"
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2"
              style={{
                background: 'var(--vq-bg)',
                border: '1px solid var(--vq-border)',
                color: 'var(--vq-text)',
              }}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: 'var(--vq-accent-1)' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 font-bold text-lg rounded-2xl text-white transition-colors disabled:opacity-50"
            style={{ background: 'var(--vq-primary)' }}
          >
            {loading ? 'Creating profile...' : `Start ${name || "Adventure"}'s Quest! 🚀`}
          </button>
        </form>
      </div>
    </div>
  );
}
