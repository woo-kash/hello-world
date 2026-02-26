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

  useEffect(() => {
    fetch(`/api/gallery?id=${id}`)
      .then(r => r.json())
      .then(data => {
        // find by id from list
        const item = Array.isArray(data) ? data.find((c: Creation) => c.id === id) : data;
        setCreation(item ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white animate-pulse">
        Loading creation...
      </div>
    );
  }

  if (!creation) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
        <p className="text-xl mb-4">Creation not found.</p>
        <Link href="/gallery" className="text-purple-400 underline">Back to Gallery</Link>
      </div>
    );
  }

  const skill = creation.skill_id ? getSkillById(creation.skill_id as any) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <Link href="/gallery" className="text-purple-300 hover:text-white transition-colors text-sm">← Gallery</Link>
        <h1 className="text-white font-bold text-lg truncate flex-1">{creation.title}</h1>
        {creation.tier && <span className="text-purple-400 text-sm">{TIER_LABELS[creation.tier]}</span>}
        {skill && <span className="text-purple-300 text-sm">{skill.icon} {skill.name}</span>}
      </header>

      {/* Full-page playable preview */}
      <div className="flex-1">
        <iframe
          srcDoc={creation.code}
          sandbox="allow-scripts"
          className="w-full h-full border-none"
          style={{ minHeight: 'calc(100vh - 200px)' }}
        />
      </div>

      {/* CTA footer */}
      <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between bg-black/30">
        <p className="text-purple-300 text-sm">Built with VibeQuest 🚀</p>
        <Link
          href="/dashboard"
          className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-colors"
        >
          Build your own →
        </Link>
      </div>
    </div>
  );
}
