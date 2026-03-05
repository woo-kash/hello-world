import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  translateToCode, generateMission, generateLessonSummary,
  gameBuilderIterate, musicIterate, generateAvatar,
  Difficulty, Tier
} from '@/lib/claude';
import { containsInappropriate, CONTENT_BLOCKED_MSG } from '@/lib/contentFilter';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'FILL_ME_IN';

async function getSubscriptionStatus(clerkUserId: string): Promise<boolean> {
  if (!SUPABASE_CONFIGURED) return true;

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();
  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (!profile) return false;

  const { data: sub } = await db
    .from('subscriptions')
    .select('status')
    .eq('parent_id', profile.id)
    .eq('status', 'active')
    .single();

  return !!sub;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action } = body;

  // ── Content safety gate ─────────────────────────────────────────────
  const userText: string = (() => {
    switch (action) {
      case 'translate':       return body.userDescription ?? '';
      case 'music_iterate':   return body.kidDescription ?? '';
      case 'generate_avatar': return body.description ?? '';
      case 'game_builder': {
        const msgs: { role: string; content: string }[] = body.conversation ?? [];
        const last = [...msgs].reverse().find(m => m.role === 'user');
        return last?.content ?? '';
      }
      default: return '';
    }
  })();

  if (containsInappropriate(userText)) {
    return NextResponse.json({ error: CONTENT_BLOCKED_MSG }, { status: 400 });
  }
  // ────────────────────────────────────────────────────────────────────

  if (SUPABASE_CONFIGURED) {
    const { FREE_MISSION_IDS } = await import('@/lib/stripe');
    const { missionId } = body;
    const isFree = missionId && FREE_MISSION_IDS.includes(missionId);
    if (!isFree) {
      const hasSubscription = await getSubscriptionStatus(userId);
      if (!hasSubscription) {
        return NextResponse.json({ error: 'subscription_required' }, { status: 402 });
      }
    }
  }

  try {
    if (action === 'translate') {
      const { userDescription, missionContext, difficulty, tier } = body;
      const result = await translateToCode(userDescription, missionContext, difficulty as Difficulty, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'generate_mission') {
      const { difficulty, tier, completedConcepts } = body;
      const result = await generateMission(difficulty, tier, completedConcepts);
      return NextResponse.json(result);
    }

    if (action === 'lesson_summary') {
      const { concept, attempts, difficulty, tier } = body;
      const result = await generateLessonSummary(concept, attempts, difficulty, tier);
      return NextResponse.json(result);
    }

    if (action === 'game_builder') {
      const { conversation, tier } = body;
      const result = await gameBuilderIterate(conversation, tier);
      return NextResponse.json(result);
    }

    if (action === 'music_iterate') {
      const { currentSettings, kidDescription, tier } = body;
      const result = await musicIterate(currentSettings, kidDescription, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'generate_avatar') {
      const { description } = body;
      const result = await generateAvatar(description);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[claude route]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
