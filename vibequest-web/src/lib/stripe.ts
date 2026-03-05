import Stripe from 'stripe';

// Lazy singleton — avoids missing-key error during Next.js build
let _stripe: Stripe | null = null;
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-01-28.clover' });
  }
  return _stripe;
}
/** Convenience re-export for backwards compat */
export const stripe: Stripe = new Proxy({} as Stripe, { get: (_t, p) => getStripe()[p as keyof Stripe] });

export const PLANS = {
  monthly: {
    name: 'Monthly',
    price: 9.99,
    priceId: process.env.STRIPE_PRICE_MONTHLY!,
    description: '1 child, all missions',
    period: '/month',
  },
  annual: {
    name: 'Annual',
    price: 79.99,
    priceId: process.env.STRIPE_PRICE_ANNUAL!,
    description: '1 child — 2 months free',
    period: '/year',
  },
  family: {
    name: 'Family',
    price: 14.99,
    priceId: process.env.STRIPE_PRICE_FAMILY!,
    description: 'Up to 3 children',
    period: '/month',
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export const FREE_MISSION_IDS = [
  // First 2 missions per tier are free (game + music)
  'tier1-snake-attack',
  'tier1-music-1',
  'tier1-flap-harder',
  'tier2-snake-remix',
  'tier2-music-1',
  'tier3-snake-studio',
  'tier3-music-1',
];
