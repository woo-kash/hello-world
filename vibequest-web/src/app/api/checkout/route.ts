import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { stripe, PLANS, PlanKey } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json() as { plan: PlanKey };
  const planConfig = PLANS[plan];
  if (!planConfig) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const db = createServiceClient();
  const { data: profile } = await db
    .from('profiles')
    .select('id, email')
    .eq('clerk_user_id', userId)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    customer_email: profile.email,
    metadata: { clerk_user_id: userId, plan },
  });

  return NextResponse.json({ url: session.url });
}
