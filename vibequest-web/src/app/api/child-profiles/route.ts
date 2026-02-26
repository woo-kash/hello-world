import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_CONFIGURED = !!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'FILL_ME_IN';

// In-memory store for demo mode (no Supabase)
const demoChildren = new Map<string, any[]>();

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!SUPABASE_CONFIGURED) {
    return NextResponse.json(demoChildren.get(userId) ?? []);
  }

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();
  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json([]);

  const { data } = await db
    .from('child_profiles')
    .select('*')
    .eq('parent_id', profile.id)
    .order('created_at');

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, age, avatar } = await req.json();
  if (!name || !age) return NextResponse.json({ error: 'name and age required' }, { status: 400 });

  const tier = age <= 8 ? 1 : age <= 12 ? 2 : 3;

  if (!SUPABASE_CONFIGURED) {
    const child = {
      id: `demo-child-${Date.now()}`,
      parent_id: userId,
      name,
      age,
      tier,
      avatar: avatar ?? '🧒',
      created_at: new Date().toISOString(),
    };
    const existing = demoChildren.get(userId) ?? [];
    existing.push(child);
    demoChildren.set(userId, existing);
    return NextResponse.json(child);
  }

  const user = await currentUser();
  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();

  await db.from('profiles').upsert({
    id: userId,
    clerk_user_id: userId,
    email: user?.emailAddresses[0]?.emailAddress ?? '',
  }, { onConflict: 'clerk_user_id' });

  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile error' }, { status: 500 });

  const { data: child, error } = await db
    .from('child_profiles')
    .insert({ parent_id: profile.id, name, age, tier, avatar: avatar ?? '🧒' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(child);
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, name, age, avatar } = await req.json();
  if (!id || !name || !age) return NextResponse.json({ error: 'id, name and age required' }, { status: 400 });

  const tier = age <= 8 ? 1 : age <= 12 ? 2 : 3;

  if (!SUPABASE_CONFIGURED) {
    const children = demoChildren.get(userId) ?? [];
    const idx = children.findIndex((c: any) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    children[idx] = { ...children[idx], name, age, tier, ...(avatar !== undefined ? { avatar } : {}) };
    demoChildren.set(userId, children);
    return NextResponse.json(children[idx]);
  }

  const { createServiceClient } = await import('@/lib/supabase');
  const db = createServiceClient();

  const { data: profile } = await db
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const updatePayload: Record<string, unknown> = { name, age, tier };
  if (avatar !== undefined) updatePayload.avatar = avatar;

  const { data: child, error } = await db
    .from('child_profiles')
    .update(updatePayload)
    .eq('id', id)
    .eq('parent_id', profile.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(child);
}
