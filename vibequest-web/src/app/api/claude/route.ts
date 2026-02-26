import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import {
  translateToCode, generateMission, generateLessonSummary, builderIterate, gameBuilderIterate,
  debugIterate, remixIterate, evaluateSpec, buildFromSpec, generateVariants, evaluateJudgement,
  Difficulty, Tier
} from '@/lib/claude';

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

    if (action === 'builder_iterate') {
      const { conversation, tier } = body;
      const result = await builderIterate(conversation, tier);
      return NextResponse.json(result);
    }

    if (action === 'game_builder') {
      const { conversation, tier } = body;
      const result = await gameBuilderIterate(conversation, tier);
      return NextResponse.json(result);
    }

    if (action === 'debug_check') {
      const { buggyCode, kidDescription, missionContext, tier } = body;
      const result = await debugIterate(buggyCode, kidDescription, missionContext, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'remix_iterate') {
      const { originalCode, currentCode, kidDescription, challenges, tier } = body;
      const result = await remixIterate(originalCode, currentCode, kidDescription, challenges, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'spec_evaluate') {
      const { spec, missionContext, tier } = body;
      const result = await evaluateSpec(spec, missionContext, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'spec_build') {
      const { spec, missionContext, tier } = body;
      const result = await buildFromSpec(spec, missionContext, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'judge_generate') {
      const { missionSpec, tier } = body;
      const result = await generateVariants(missionSpec, tier as Tier);
      return NextResponse.json(result);
    }

    if (action === 'judge_evaluate') {
      const { pickedIndex, correctIndex, kidReasoning, flaws, tier } = body;
      const result = await evaluateJudgement(pickedIndex, correctIndex, kidReasoning, flaws, tier as Tier);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[claude route]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
