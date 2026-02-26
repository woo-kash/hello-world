import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceClient } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 });
  }

  const db = createServiceClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkUserId = session.metadata?.clerk_user_id;
      const plan = session.metadata?.plan as 'monthly' | 'annual' | 'family';

      if (!clerkUserId || !plan) break;

      const { data: profile } = await db
        .from('profiles')
        .select('id')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (!profile) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;

      await db.from('subscriptions').upsert({
        parent_id: profile.id,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        plan,
        status: 'active',
        current_period_end: new Date((subscription.current_period_end ?? subscription.items?.data[0]?.billing_cycle_anchor ?? Date.now() / 1000) * 1000).toISOString(),
      }, { onConflict: 'parent_id' });

      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription & { current_period_end?: number };

      const status = subscription.status === 'active' ? 'active'
        : subscription.status === 'past_due' ? 'past_due'
        : 'canceled';

      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : new Date().toISOString();

      await db.from('subscriptions')
        .update({ status, current_period_end: periodEnd })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
