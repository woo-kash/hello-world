# VibeQuest Setup Guide

## Stack
- **Next.js 16** (App Router) — frontend + API routes
- **Clerk** — auth (parent accounts + child profiles)
- **Supabase** — PostgreSQL database
- **Stripe** — subscriptions
- **Anthropic Claude** — AI engine (server-side only)
- **Vercel** — deployment

---

## Step 1: External Services

### 1a. Clerk (Auth)
1. Sign up at https://dashboard.clerk.com
2. Create a new application → choose "Email + Google"
3. Copy your keys from API Keys page

### 1b. Supabase (Database)
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings → API → copy URL and keys
4. Run the migration: go to SQL Editor → paste contents of `supabase/migrations/001_init.sql` → run

### 1c. Stripe (Payments)
1. Sign up at https://dashboard.stripe.com
2. Create 3 products:
   - **Monthly**: $9.99/month recurring → copy price ID
   - **Annual**: $79.99/year recurring → copy price ID
   - **Family**: $14.99/month recurring → copy price ID
3. Enable Stripe Customer Portal (Billing → Customer portal → Activate)
4. Set up webhook endpoint (see Step 3)

### 1d. Anthropic API
1. Sign up at https://console.anthropic.com
2. Create an API key

---

## Step 2: Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Fill in every variable. The app won't start without them.

---

## Step 3: Stripe Webhook (Local Dev)

Install Stripe CLI and forward webhooks:

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the webhook signing secret it outputs → paste into `.env.local` as `STRIPE_WEBHOOK_SECRET`

---

## Step 4: Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## Step 5: Deploy to Vercel

```bash
npx vercel
```

Add all env vars in Vercel dashboard (Settings → Environment Variables).

For the Stripe webhook in production:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret → add to Vercel env vars

---

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/pricing` | Pricing page |
| `/sign-up` | Sign up (Clerk) |
| `/sign-in` | Sign in (Clerk) |
| `/onboarding` | Add first child profile |
| `/dashboard` | Parent dashboard + mission list |
| `/play/[tier]/[missionId]` | Game screen |

## Monetization Summary

| Plan | Price | Children | Access |
|------|-------|----------|--------|
| Free | $0 | 1 | 3 missions |
| Monthly | $9.99/mo | 1 | All missions |
| Annual | $79.99/yr | 1 | All missions |
| Family | $14.99/mo | Up to 3 | All missions |

Free missions (no subscription needed):
- `mission-1` (Robot Escape)
- `mission-2` (Light Up Stars)
- `mission-3` (Hungry Bunny)
- `tier2-mission-1` (Calculator)
- `tier3-mission-1` (Landing Page)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── pricing/page.tsx            # Pricing
│   ├── (auth)/
│   │   ├── sign-in/               # Clerk sign-in
│   │   ├── sign-up/               # Clerk sign-up
│   │   └── onboarding/            # Add child profile
│   ├── (app)/
│   │   ├── dashboard/             # Parent dashboard
│   │   └── play/[tier]/[id]/      # Game screen
│   └── api/
│       ├── claude/                 # Claude AI proxy
│       ├── checkout/               # Stripe checkout
│       ├── stripe/webhook/         # Stripe webhook handler
│       ├── progress/               # Save mission progress
│       └── child-profiles/         # CRUD child profiles
├── lib/
│   ├── claude.ts                   # AI functions (server-side)
│   ├── missions.ts                 # 20+ missions library
│   ├── gameEngine.ts               # Logic block executor
│   ├── supabase.ts                 # DB client
│   └── stripe.ts                   # Stripe client + plan config
├── components/game/
│   ├── GridGame.tsx                # Animated robot maze
│   ├── StarsGame.tsx               # Animated star lighting
│   ├── LogicBlockTree.tsx          # Visual logic blocks
│   └── VictoryScreen.tsx           # Post-mission celebration
└── proxy.ts                        # Auth guard (Clerk)
```

## Adding New Missions

Edit `src/lib/missions.ts` and add to the appropriate tier array. The mission ID must be unique. Set `free: true` to make it a free tier mission.

## Customising Pricing

Edit `src/lib/stripe.ts` → `PLANS` and `FREE_MISSION_IDS`.
Update `src/app/pricing/page.tsx` → `PLANS` array for UI.
