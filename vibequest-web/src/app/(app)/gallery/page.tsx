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
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Dashboard</Link>
          <span style={{ color: 'var(--vq-border)' }}>|</span>
          <span className="text-2xl">🖼️</span>
          <span className="font-bold text-xl" style={{ color: 'var(--vq-text)' }}>Creation Gallery</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--vq-text)' }}>What kids have built</h1>
          <p style={{ color: 'var(--vq-muted)' }}>Every creation here was built by a real kid, using AI as their tool.</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8">
          {['all', '1', '2', '3'].map(t => (
            <button
              key={t}
              onClick={() => { setFilterTier(t); setLoading(true); }}
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              style={{
                background: filterTier === t ? 'var(--vq-primary)' : 'var(--vq-card)',
                color: filterTier === t ? 'white' : 'var(--vq-muted)',
                border: '1px solid var(--vq-border)',
              }}
            >
              {t === 'all' ? 'All Tiers' : TIER_LABELS[parseInt(t)]}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center animate-pulse py-20" style={{ color: 'var(--vq-muted)' }}>Loading creations... 🎨</div>
        ) : creations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-xl font-bold mb-2" style={{ color: 'var(--vq-text)' }}>No creations yet!</p>
            <p className="mb-6" style={{ color: 'var(--vq-muted)' }}>Complete a mission and hit &quot;Ship It&quot; to be the first.</p>
            <Link href="/dashboard" className="text-white px-6 py-3 rounded-xl font-semibold transition-colors" style={{ background: 'var(--vq-primary)' }}>
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
                  className="group rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-md"
                  style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}
                >
                  {/* Mini preview */}
                  <div className="h-40 overflow-hidden relative" style={{ background: 'var(--vq-bg)' }}>
                    <iframe
                      srcDoc={c.code}
                      sandbox="allow-scripts"
                      className="w-full h-full border-none scale-50 origin-top-left pointer-events-none"
                      style={{ width: '200%', height: '200%' }}
                    />
                    <div className="absolute inset-0 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100" style={{ background: 'rgba(31,179,143,0.12)' }}>
                      <span className="text-white px-4 py-2 rounded-full text-sm font-semibold" style={{ background: 'var(--vq-primary)' }}>▶ Play</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2 truncate" style={{ color: 'var(--vq-text)' }}>{c.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {c.tier && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${TIER_COLORS[c.tier] ?? ''}`}>
                          {TIER_LABELS[c.tier] ?? `Tier ${c.tier}`}
                        </span>
                      )}
                      {skill && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,77,255,0.12)', color: 'var(--vq-purple)' }}>
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
