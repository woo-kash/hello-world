'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AVATARS = ['🧒', '👧', '👦', '🧑', '🧒‍♀️', '🦸', '🧙', '🚀', '🦊', '🐉', '🤖', '⭐'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'child'>('welcome');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('🧒');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tier = parseInt(age) <= 8 ? 1 : parseInt(age) <= 12 ? 2 : 3;
  const tierLabel = tier === 1 ? 'Explorer (6–8)' : tier === 2 ? 'Adventurer (9–12)' : 'Vibe Coder (13–16)';
  const tierEmoji = tier === 1 ? '🌟' : tier === 2 ? '🗺️' : '💻';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="text-7xl mb-6">🚀</div>
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to VibeQuest!</h1>
          <p className="text-purple-200 text-lg mb-8">
            Let&apos;s set up your child&apos;s coding adventure. It only takes 30 seconds!
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { emoji: '🌟', label: 'Explorers', age: 'Ages 6–8' },
              { emoji: '🗺️', label: 'Adventurers', age: 'Ages 9–12' },
              { emoji: '💻', label: 'Vibe Coders', age: 'Ages 13–16' },
            ].map(({ emoji, label, age }) => (
              <div key={label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="text-white font-semibold">{label}</div>
                <div className="text-purple-200 text-sm">{age}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setStep('child')}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xl rounded-2xl transition-colors"
          >
            Set Up Your Child&apos;s Profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">{avatar}</div>
          <h2 className="text-3xl font-bold text-white">Create Child&apos;s Profile</h2>
          {age && (
            <div className="mt-2 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1">
              <span>{tierEmoji}</span>
              <span className="text-purple-200 text-sm">{tierLabel}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur rounded-3xl p-8 space-y-6">
          {/* Avatar picker */}
          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">Pick an avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`text-2xl p-2 rounded-xl transition-all ${
                    avatar === a ? 'bg-yellow-400 scale-110' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">Child&apos;s name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              className="w-full bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {/* Age */}
          <div>
            <label className="text-purple-200 text-sm font-medium mb-2 block">Child&apos;s age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="e.g. 9"
              min="4"
              max="17"
              className="w-full bg-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-gray-900 font-bold text-lg rounded-2xl transition-colors"
          >
            {loading ? 'Creating profile...' : `Start ${name || "Adventure"}'s Quest! 🚀`}
          </button>
        </form>
      </div>
    </div>
  );
}
