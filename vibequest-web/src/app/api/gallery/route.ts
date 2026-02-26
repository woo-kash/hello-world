import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'FILL_ME_IN';

// In-memory gallery for demo mode
const demoGallery: any[] = [];
let nextId = 1;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');
  const skill = searchParams.get('skill');
  const limit = parseInt(searchParams.get('limit') ?? '24');

  if (!SUPABASE_CONFIGURED) {
    let items = [...demoGallery].reverse();
    if (tier) items = items.filter(i => String(i.tier) === tier);
    if (skill) items = items.filter(i => i.skill_id === skill);
    return NextResponse.json(items.slice(0, limit));
  }

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();
  let query = db.from('gallery').select('*').order('created_at', { ascending: false }).limit(limit);
  if (tier) query = query.eq('tier', parseInt(tier));
  if (skill) query = query.eq('skill_id', skill);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { childId, title, code, tier, missionId, skillId } = await req.json();
  if (!code || !title) return NextResponse.json({ error: 'title and code required' }, { status: 400 });

  if (!SUPABASE_CONFIGURED) {
    const item = {
      id: String(nextId++),
      child_id: childId,
      title,
      code,
      tier,
      mission_id: missionId,
      skill_id: skillId,
      created_at: new Date().toISOString(),
    };
    demoGallery.push(item);
    return NextResponse.json({ id: item.id });
  }

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();
  const { data, error } = await db.from('gallery').insert({
    child_id: childId,
    title,
    code,
    tier,
    mission_id: missionId,
    skill_id: skillId,
    created_at: new Date().toISOString(),
  }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data?.id });
}
