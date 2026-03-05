'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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

export default function GalleryItemPage() {
  const params = useParams();
  const id = params.id as string;
  const [creation, setCreation] = useState<Creation | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/gallery?id=${id}`)
      .then(r => r.json())
      .then(data => {
        const item = Array.isArray(data) ? data.find((c: Creation) => c.id === id) : data;
        setCreation(item ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--vq-bg)' }}>
        <div className="text-xl animate-pulse font-bold" style={{ color: 'var(--vq-primary)' }}>Loading creation... 🎨</div>
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--vq-bg)', color: 'var(--vq-text)' }}>
        <p className="text-xl mb-4">Creation not found.</p>
        <Link href="/gallery" className="underline" style={{ color: 'var(--vq-primary)' }}>Back to Gallery</Link>
      </div>
    );
  }

  const skill = creation.skill_id ? getSkillById(creation.skill_id as any) : null;

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: creation!.title + ' — VibeQuest', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/gallery" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>← Gallery</Link>
        <h1 className="font-bold text-lg truncate flex-1" style={{ color: 'var(--vq-text)' }}>{creation.title}</h1>
        {creation.tier && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(31,179,143,0.10)', color: 'var(--vq-primary)' }}>
            {TIER_LABELS[creation.tier]}
          </span>
        )}
        {skill && (
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'rgba(124,77,255,0.10)', color: 'var(--vq-purple)' }}>
            {skill.icon} {skill.name}
          </span>
        )}
      </header>

      {/* Full-page playable preview */}
      <div className="flex-1">
        <iframe
          srcDoc={creation.code}
          sandbox="allow-scripts"
          className="w-full h-full border-none"
          style={{ minHeight: 'calc(100vh - 130px)' }}
        />
      </div>

      {/* CTA footer */}
      <div className="border-t px-6 py-3 flex items-center justify-between" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--vq-muted)' }}>Built with VibeQuest</p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl font-semibold text-sm transition-all vq-card-hover"
            style={{ border: '1px solid var(--vq-border)', color: 'var(--vq-text)', background: 'var(--vq-bg)' }}
          >
            {shareCopied ? '✅ Copied!' : '🔗 Share'}
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all vq-btn-primary"
          >
            Build your own →
          </Link>
        </div>
      </div>
    </div>
  );
}
