'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSkillById } from '@/lib/skills';

interface Creation {
  id: string;
  title: string;
  tier: number;
  skill_id: string | null;
  created_at: string;
  code: string;
}

const TIER_LABELS: Record<number, string> = { 1: 'Explorer', 2: 'Adventurer', 3: 'Vibe Coder' };
const TIER_COLORS: Record<number, string> = {
  1: 'bg-yellow-500/20 text-yellow-300',
  2: 'bg-blue-500/20 text-blue-300',
  3: 'bg-green-500/20 text-green-300',
};

export default function GalleryPage() {
  const [creations, setCreations] = useState<Creation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState<string>('all');

  useEffect(() => {
    const params = filterTier !== 'all' ? `?tier=${filterTier}` : '';
    fetch(`/api/gallery${params}`)
      .then(r => r.json())
      .then(data => { setCreations(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filterTier]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-purple-300 hover:text-white transition-colors text-sm">← Dashboard</Link>
          <span className="text-white/30">|</span>
          <span className="text-2xl">🖼️</span>
          <span className="text-white font-bold text-xl">Creation Gallery</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">What kids have built</h1>
          <p className="text-purple-300">Every creation here was built by a real kid, using AI as their tool.</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          {['all', '1', '2', '3'].map(t => (
            <button
              key={t}
              onClick={() => { setFilterTier(t); setLoading(true); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filterTier === t ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
            >
              {t === 'all' ? 'All Tiers' : TIER_LABELS[parseInt(t)]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-white text-center animate-pulse py-20">Loading creations... 🎨</div>
        ) : creations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-white text-xl font-bold mb-2">No creations yet!</p>
            <p className="text-purple-300 mb-6">Complete a mission and hit "Ship It" to be the first.</p>
            <Link href="/dashboard" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              Start building →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map(c => {
              const skill = c.skill_id ? getSkillById(c.skill_id as any) : null;
              return (
                <Link
                  key={c.id}
                  href={`/gallery/${c.id}`}
                  className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all hover:scale-[1.02]"
                >
                  {/* Mini preview */}
                  <div className="h-40 bg-gray-900 overflow-hidden relative">
                    <iframe
                      srcDoc={c.code}
                      sandbox="allow-scripts"
                      className="w-full h-full border-none scale-50 origin-top-left pointer-events-none"
                      style={{ width: '200%', height: '200%' }}
                    />
                    <div className="absolute inset-0 group-hover:bg-purple-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">▶ Play</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-2 truncate">{c.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.tier && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_COLORS[c.tier] ?? 'bg-white/10 text-white/60'}`}>
                          {TIER_LABELS[c.tier] ?? `Tier ${c.tier}`}
                        </span>
                      )}
                      {skill && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                          {skill.icon} {skill.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
