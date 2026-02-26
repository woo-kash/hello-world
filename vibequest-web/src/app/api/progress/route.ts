import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getMissionById } from '@/lib/missions';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'FILL_ME_IN';

// In-memory store for demo mode
const demoProgress = new Map<string, any[]>();

function computeProgressStats(records: any[]) {
  const completed = records.filter((p: any) => p.completed);
  const totalXp = completed.reduce((sum: number, p: any) => sum + (p.xp_earned ?? 0), 0);
  const skills: Record<string, number> = {};
  for (const p of completed) {
    if (p.skill_practiced) {
      skills[p.skill_practiced] = (skills[p.skill_practiced] ?? 0) + 1;
    }
  }
  return { totalXp, skills };
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get('childId');
  if (!childId) return NextResponse.json({ error: 'childId required' }, { status: 400 });

  if (!SUPABASE_CONFIGURED) {
    const records = demoProgress.get(childId) ?? [];
    const { totalXp, skills } = computeProgressStats(records);
    return NextResponse.json({ records, totalXp, skills });
  }

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();
  const { data } = await db
    .from('mission_progress')
    .select('*')
    .eq('child_id', childId);

  const records = data ?? [];
  const { totalXp, skills } = computeProgressStats(records);
  return NextResponse.json({ records, totalXp, skills });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { childId, missionId, completed, attempts, badge } = await req.json();

  // Look up XP and skill from the mission definition
  const mission = getMissionById(missionId);
  const xpEarned = completed ? (mission?.xp ?? 0) : 0;
  const skillPracticed = mission?.primarySkill ?? null;

  if (!SUPABASE_CONFIGURED) {
    const existing = demoProgress.get(childId) ?? [];
    const idx = existing.findIndex((p: any) => p.mission_id === missionId);
    const entry = {
      child_id: childId,
      mission_id: missionId,
      completed,
      attempts,
      badge: badge ?? null,
      xp_earned: xpEarned,
      skill_practiced: skillPracticed,
      completed_at: completed ? new Date().toISOString() : null,
    };
    if (idx >= 0) existing[idx] = entry;
    else existing.push(entry);
    demoProgress.set(childId, existing);
    return NextResponse.json({ success: true, xpEarned, skillPracticed });
  }

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();

  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const { error } = await db.from('mission_progress').upsert({
    child_id: childId,
    mission_id: missionId,
    completed,
    attempts,
    badge: badge ?? null,
    xp_earned: xpEarned,
    skill_practiced: skillPracticed,
    completed_at: completed ? new Date().toISOString() : null,
  }, { onConflict: 'child_id,mission_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, xpEarned, skillPracticed });
}
