'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const PLANS = [
  {
    key: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    description: '1 child profile',
    features: ['All missions unlocked', 'All 3 age tiers', 'Progress tracking', 'Badges & certificates', 'New missions monthly'],
    cta: 'Start Monthly',
    highlight: false,
  },
  {
    key: 'annual',
    name: 'Annual',
    price: '$79.99',
    period: '/year',
    description: '1 child — save 33%!',
    features: ['Everything in Monthly', '2 months FREE', 'Priority new content', 'All future features'],
    cta: 'Best Value — Start Annual',
    highlight: true,
  },
  {
    key: 'family',
    name: 'Family',
    price: '$14.99',
    period: '/month',
    description: 'Up to 3 children',
    features: ['3 child profiles', 'All missions for each child', 'Individual progress per child', 'Parent dashboard'],
    cta: 'Start Family Plan',
    highlight: false,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(plan: string) {
    setLoading(plan);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    if (res.status === 401) {
      router.push(`/sign-up?redirect=/pricing`);
      return;
    }

    const { url } = await res.json();
    if (url) window.location.href = url;
    else setLoading(null);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/logo.png" width={32} height={32} alt="VibeQuest" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--vq-text)' }}>VibeQuest</span>
        </Link>
        <Link href="/dashboard" className="text-sm transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>
          Dashboard →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--vq-text)' }}>Simple, Transparent Pricing</h1>
          <p className="text-lg" style={{ color: 'var(--vq-muted)' }}>
            Start free with 3 missions. Unlock everything with a subscription.
          </p>
          <div className="mt-4 inline-block rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(31,179,143,0.1)', border: '1px solid rgba(31,179,143,0.25)', color: 'var(--vq-primary)' }}>
            ✅ Free tier includes 3 missions — no credit card required
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.key}
              className="relative rounded-3xl p-8"
              style={{
                background: plan.highlight ? 'rgba(31,179,143,0.06)' : 'var(--vq-card)',
                border: plan.highlight ? '2px solid var(--vq-primary)' : '1px solid var(--vq-border)',
              }}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full text-white" style={{ background: 'var(--vq-primary)' }}>
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h2 className="font-bold text-xl mb-1" style={{ color: 'var(--vq-text)' }}>{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: 'var(--vq-text)' }}>{plan.price}</span>
                  <span style={{ color: 'var(--vq-muted)' }}>{plan.period}</span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--vq-muted)' }}>{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--vq-muted)' }}>
                    <span className="mt-0.5" style={{ color: 'var(--vq-primary)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
                className="w-full py-3 rounded-xl font-bold transition-colors disabled:opacity-50"
                style={{
                  background: plan.highlight ? 'var(--vq-primary)' : 'var(--vq-bg)',
                  color: plan.highlight ? 'white' : 'var(--vq-text)',
                  border: plan.highlight ? 'none' : '1px solid var(--vq-border)',
                }}
              >
                {loading === plan.key ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="font-bold text-2xl text-center mb-8" style={{ color: 'var(--vq-text)' }}>Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: 'What age is VibeQuest for?', a: 'Ages 6–16, split into three tiers: Explorers (6–8), Adventurers (9–12), and Vibe Coders (13–16). The content and difficulty adapts automatically.' },
              { q: 'Do I need coding experience?', a: "None at all! Explorers just describe solutions in plain English. Every tier starts from zero and builds up gradually." },
              { q: 'What is vibe coding?', a: 'Vibe coding means using AI to help you build things — describing what you want and working with AI to make it happen. It is the most important skill for the next generation.' },
              { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime from your account dashboard. You keep access until the end of your billing period.' },
              { q: 'Is there a free trial?', a: 'Yes! The first 3 missions in each tier are completely free — no credit card required. You can see exactly what your child will experience before subscribing.' },
              { q: 'How many children can use one account?', a: 'Monthly and Annual plans include 1 child profile. The Family plan includes up to 3 child profiles, each with their own progress and tier.' },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl p-6" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
                <p className="font-semibold mb-2" style={{ color: 'var(--vq-text)' }}>{q}</p>
                <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
