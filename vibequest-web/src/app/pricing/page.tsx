'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-white font-bold text-xl">VibeQuest</span>
        </Link>
        <Link href="/dashboard" className="text-purple-300 hover:text-white text-sm transition-colors">
          Dashboard →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h1>
          <p className="text-purple-200 text-lg">
            Start free with 3 missions. Unlock everything with a subscription.
          </p>
          <div className="mt-4 inline-block bg-green-500/20 border border-green-400/30 rounded-full px-4 py-2 text-green-300 text-sm">
            ✅ Free tier includes 3 missions — no credit card required
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.key}
              className={`relative rounded-3xl p-8 ${
                plan.highlight
                  ? 'bg-gradient-to-b from-purple-600/40 to-blue-600/40 border-2 border-purple-400/50'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-white font-bold text-xl mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-purple-300">{plan.period}</span>
                </div>
                <p className="text-purple-300 text-sm mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-purple-200">
                    <span className="text-green-400 mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.key)}
                disabled={loading === plan.key}
                className={`w-full py-3 rounded-xl font-bold transition-colors ${
                  plan.highlight
                    ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                } disabled:opacity-50`}
              >
                {loading === plan.key ? 'Redirecting...' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-white font-bold text-2xl text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: 'What age is VibeQuest for?', a: 'Ages 6–16, split into three tiers: Explorers (6–8), Adventurers (9–12), and Vibe Coders (13–16). The content and difficulty adapts automatically.' },
              { q: 'Do I need coding experience?', a: "None at all! Explorers just describe solutions in plain English. Every tier starts from zero and builds up gradually." },
              { q: 'What is vibe coding?', a: 'Vibe coding means using AI to help you build things — describing what you want and working with AI to make it happen. It is the most important skill for the next generation.' },
              { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime from your account dashboard. You keep access until the end of your billing period.' },
              { q: 'Is there a free trial?', a: 'Yes! The first 3 missions in each tier are completely free — no credit card required. You can see exactly what your child will experience before subscribing.' },
              { q: 'How many children can use one account?', a: 'Monthly and Annual plans include 1 child profile. The Family plan includes up to 3 child profiles, each with their own progress and tier.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white/5 rounded-2xl p-6">
                <p className="text-white font-semibold mb-2">{q}</p>
                <p className="text-purple-300 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
