import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import Image from 'next/image';

const SKILLS_GRID = [
  { icon: '🧩', name: 'Decomposition', desc: 'Breaking big problems into small pieces', category: 'Thinking' },
  { icon: '🔗', name: 'Systems Thinking', desc: 'Understanding how parts connect', category: 'Thinking' },
  { icon: '🔍', name: 'Pattern Recognition', desc: 'Seeing what repeats and reusing it', category: 'Thinking' },
  { icon: '🎯', name: 'Precision of Language', desc: 'Saying exactly what you mean', category: 'Communication' },
  { icon: '💬', name: 'Giving Feedback', desc: 'Describing what needs to change', category: 'Communication' },
  { icon: '📋', name: 'Specification Writing', desc: 'Describing done before starting', category: 'Communication' },
  { icon: '⚡', name: 'Rapid Prototyping', desc: 'Build fast, then improve', category: 'Building' },
  { icon: '🐛', name: 'Debugging with AI', desc: 'Finding and fixing what broke', category: 'Building' },
  { icon: '🎨', name: 'Remix & Extend', desc: 'Taking something and making it yours', category: 'Building' },
  { icon: '🤖', name: 'AI Literacy', desc: 'Knowing when to trust AI — and when not to', category: 'Meta' },
];

const PARENT_ANXIETIES = [
  {
    fear: '"My kid will be left behind"',
    answer: 'By 12 they\'re building apps. By 16, they\'re shipping products. VibeQuest kids don\'t just use AI — they direct it.',
    emoji: '📈',
    accent: '#FF6B6B',
  },
  {
    fear: '"My kid just consumes AI, not creates with it"',
    answer: 'Every mission ends with something they MADE — a game, an app, a tool. The AI is a tool in their hands, not a replacement for their thinking.',
    emoji: '🔨',
    accent: '#1fb38f',
  },
  {
    fear: '"I can\'t evaluate tech education"',
    answer: 'The skill dashboard shows exactly what they\'re learning, in plain English. No jargon. No guessing.',
    emoji: '📊',
    accent: '#FFD166',
  },
];

const FAQ = [
  {
    q: 'How is this different from Scratch?',
    a: 'Scratch teaches syntax and visual blocks. VibeQuest teaches you to work with AI — describing what you want, evaluating the output, and iterating. That\'s the skill that matters in 2025.',
  },
  {
    q: 'My child isn\'t into coding — will they like this?',
    a: 'VibeQuest kids build games they actually want to play and apps they actually want to use. The missions are adventures, not exercises. Most kids don\'t realise they\'re learning.',
  },
  {
    q: 'How do I know what they\'re learning?',
    a: 'The parent dashboard tracks 10 specific skills with plain-English explanations of each. You\'ll see exactly what your child practiced this week and why it matters.',
  },
  {
    q: 'Is it safe? What data do you collect?',
    a: 'All AI interactions are sandboxed — no external networks, no data collection from kids. We collect only what\'s needed to run the app. Your child\'s work stays yours.',
  },
];

const TIERS = [
  {
    emoji: '🌟',
    name: 'Explorers',
    age: 'Ages 6–8',
    color: 'from-yellow-400 to-orange-500',
    builds: ['Build Snake Attack, Flappy & Alien Invasion', 'Compose Space Jam beats & Jungle rhythms', 'Animate a doodle scene'],
  },
  {
    emoji: '🗺️',
    name: 'Adventurers',
    age: 'Ages 9–12',
    color: 'from-blue-400 to-purple-500',
    builds: ['Remix a calculator, build a chatbot', 'Design a game with custom physics', 'Animate a multi-element scene'],
  },
  {
    emoji: '💻',
    name: 'Vibe Coders',
    age: 'Ages 13–16',
    color: 'from-green-400 to-cyan-500',
    builds: ['Spec a messenger, ship a full game studio', 'Build an AI detector or chatbot app', 'Animate with physics & particle systems'],
  },
];

const MISSION_TYPES = [
  { icon: '🎮', label: 'Game Builder', color: '#F97316', desc: 'Customise and ship your own playable games' },
  { icon: '🖼️', label: 'Animator Studio', color: '#7C4DFF', desc: 'Draw a scene, describe the magic, watch it move' },
  { icon: '🎵', label: 'Music Builder', color: '#22C55E', desc: 'Compose beats, melodies and full soundscapes' },
  { icon: '🐛', label: 'Debug & Remix', color: '#EF4444', desc: 'Squash bugs and transform apps into your own' },
  { icon: '📋', label: 'Build & Spec', color: '#3B82F6', desc: 'Describe your app in English, then watch AI build it' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Thinking: '#7C4DFF',
  Communication: '#1fb38f',
  Building: '#FF6B6B',
  Meta: '#FFD166',
};

export default function HomePage() {
  return (
    <div className="vq-stars-bg min-h-screen" style={{ background: 'var(--vq-bg)', color: 'var(--vq-text)' }}>
      {/* Nav */}
      <nav className="border-b border-[var(--vq-border)] px-6 py-4 flex items-center justify-between" style={{ background: 'var(--vq-surface)' }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/logo.png" width={32} height={32} alt="VibeQuest" />
          </div>
          <span className="font-black text-xl tracking-tight" style={{ color: 'var(--vq-text)' }}>VibeQuest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-sm transition-colors" style={{ color: 'var(--vq-purple)' }}>Pricing</Link>
          <SignedOut>
            <Link href="/sign-in" className="text-sm transition-colors" style={{ color: 'var(--vq-purple)' }}>Sign In</Link>
            <Link
              href="/sign-up"
              className="px-4 py-2 text-white font-bold text-sm rounded-xl transition-all hover:scale-105"
              style={{ background: 'var(--vq-primary)' }}
            >
              Start Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-white font-bold text-sm rounded-xl transition-all hover:scale-105"
              style={{ background: 'var(--vq-primary)' }}
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center relative z-10">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm mb-8 border"
          style={{ background: 'rgba(31,179,143,0.08)', borderColor: 'var(--vq-border)', color: 'var(--vq-primary)' }}
        >
          <span>✨</span>
          <span>Powered by Claude AI · Built for the AI generation</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black leading-tight mb-6 tracking-tight" style={{ color: 'var(--vq-text)' }}>
          Every child will use AI at work.<br />
          <span
            className="text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(to right, var(--vq-primary), var(--vq-purple))' }}
          >
            Will yours direct it — or be directed by it?
          </span>
        </h1>

        <p className="text-xl max-w-2xl mx-auto mb-4" style={{ color: 'var(--vq-muted)' }}>
          VibeQuest teaches the 10 skills that actually matter in the AI era: how to think clearly, communicate precisely, and build with AI. Starting from age 6.
        </p>
        <p className="mb-10 text-sm" style={{ color: 'var(--vq-muted)' }}>No coding experience required — from either of you.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            href="/sign-up"
            className="px-8 py-5 text-white font-black text-xl rounded-2xl transition-all hover:scale-105 inline-flex items-center gap-2 shadow-lg"
            style={{ background: 'var(--vq-primary)', boxShadow: '0 0 30px rgba(31,179,143,0.25)' }}
          >
            Start Free — 3 Missions Included ✨
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-5 font-bold text-xl rounded-2xl transition-all border"
            style={{ color: 'var(--vq-text)', borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}
          >
            See Pricing →
          </Link>
        </div>
        <p className="text-sm" style={{ color: 'var(--vq-muted)' }}>No credit card required · Cancel anytime</p>
      </section>

      {/* Mission Types */}
      <section className="max-w-5xl mx-auto px-6 pb-16 relative z-10">
        <h2 className="text-2xl font-black text-center mb-3" style={{ color: 'var(--vq-text)' }}>5 ways to learn</h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--vq-muted)' }}>Every mission type builds a different superpower</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MISSION_TYPES.map(mt => (
            <div
              key={mt.label}
              className="rounded-3xl p-4 text-center hover:scale-105 transition-all"
              style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)', borderLeft: `4px solid ${mt.color}` }}
            >
              <div className="text-3xl mb-2">{mt.icon}</div>
              <div className="font-bold text-sm mb-1" style={{ color: 'var(--vq-text)' }}>{mt.label}</div>
              <div className="text-xs" style={{ color: 'var(--vq-muted)' }}>{mt.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* The 10 Skills */}
      <section className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <h2 className="text-3xl font-black text-center mb-3" style={{ color: 'var(--vq-text)' }}>The 10 skills that matter</h2>
        <p className="text-center mb-12 text-sm" style={{ color: 'var(--vq-muted)' }}>Not syntax. Not memorisation. The skills that make someone great at working with AI.</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SKILLS_GRID.map(s => (
            <div
              key={s.name}
              className="rounded-3xl p-4 text-center hover:scale-105 transition-all"
              style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-bold text-sm mb-1" style={{ color: 'var(--vq-text)' }}>{s.name}</div>
              <div className="text-xs mb-2" style={{ color: 'var(--vq-muted)' }}>{s.desc}</div>
              <div
                className="text-xs font-bold px-2 py-0.5 rounded-full inline-block"
                style={{ background: `${CATEGORY_COLORS[s.category]}18`, color: CATEGORY_COLORS[s.category] }}
              >
                {s.category}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What kids build */}
      <section className="border-y border-[var(--vq-border)] py-20 relative z-10" style={{ background: 'rgba(31,179,143,0.03)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-3" style={{ color: 'var(--vq-text)' }}>What kids actually build</h2>
          <p className="text-center mb-12 text-sm" style={{ color: 'var(--vq-muted)' }}>Every mission ends with something real. Not a worksheet — something they made.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(tier => (
              <div
                key={tier.name}
                className="rounded-3xl p-8 hover:scale-105 transition-all"
                style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}
              >
                <div className={`inline-flex items-center gap-2 text-sm font-black px-3 py-1.5 rounded-full bg-gradient-to-r ${tier.color} text-white mb-4`}>
                  <span>{tier.emoji}</span>
                  <span>{tier.name} · {tier.age}</span>
                </div>
                <ul className="space-y-2">
                  {tier.builds.map(b => (
                    <li key={b} className="text-sm flex items-center gap-2" style={{ color: 'var(--vq-muted)' }}>
                      <span style={{ color: 'var(--vq-primary)' }}>✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why parents choose VibeQuest */}
      <section className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <h2 className="text-3xl font-black text-center mb-3" style={{ color: 'var(--vq-text)' }}>Why parents choose VibeQuest</h2>
        <p className="text-center mb-12 text-sm" style={{ color: 'var(--vq-muted)' }}>We know what keeps parents up at night. Here&apos;s how we address it.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PARENT_ANXIETIES.map(a => (
            <div
              key={a.emoji}
              className="rounded-3xl p-8"
              style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)', borderLeft: `4px solid ${a.accent}` }}
            >
              <div className="text-4xl mb-4">{a.emoji}</div>
              <p className="font-bold mb-3 italic text-sm" style={{ color: 'var(--vq-text)' }}>{a.fear}</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--vq-muted)' }}>{a.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-[var(--vq-border)] py-16 relative z-10" style={{ background: 'rgba(31,179,143,0.03)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <span key={i} className="text-xl" style={{ color: 'var(--vq-accent-3)' }}>⭐</span>)}
          </div>
          <p className="text-2xl font-bold mb-4" style={{ color: 'var(--vq-text)' }}>
            &ldquo;My 8-year-old built her first robot game in 20 minutes. She has not stopped talking about coding since.&rdquo;
          </p>
          <p style={{ color: 'var(--vq-muted)' }}>— Parent of an Explorer-tier student</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20 relative z-10">
        <h2 className="text-3xl font-black text-center mb-12" style={{ color: 'var(--vq-text)' }}>Parent FAQ</h2>
        <div className="space-y-4">
          {FAQ.map(({ q, a }) => (
            <div
              key={q}
              className="rounded-3xl p-6"
              style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}
            >
              <h3 className="font-bold mb-2" style={{ color: 'var(--vq-text)' }}>{q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--vq-muted)' }}>{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center relative z-10">
        <div className="mb-6 flex justify-center">
          <div style={{ width: 96, height: 96, borderRadius: 20, overflow: 'hidden' }}>
            <Image src="/logo.png" width={96} height={96} alt="VibeQuest" />
          </div>
        </div>
        <h2 className="text-4xl font-black mb-4" style={{ color: 'var(--vq-text)' }}>Your child&apos;s AI superpower starts here</h2>
        {/* Season banner */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: 'rgba(31,179,143,0.10)', border: '1px solid rgba(31,179,143,0.30)', color: 'var(--vq-primary)' }}>
          <span>🌱</span>
          <span>Spring 2026 Season live — new challenge every 2 days. All kids, same day.</span>
        </div>
        <p className="mb-8 text-lg" style={{ color: 'var(--vq-muted)' }}>
          3 free missions. No credit card. Your child could complete their first mission in 5 minutes.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-10 py-5 text-white font-black text-xl rounded-2xl transition-all hover:scale-105 shadow-lg"
          style={{ background: 'var(--vq-primary)', boxShadow: '0 0 40px rgba(31,179,143,0.25)' }}
        >
          Start Free Today →
        </Link>
        <p className="text-sm mt-4" style={{ color: 'var(--vq-muted)' }}>Then from $9.99/month · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--vq-border)] px-6 py-8 text-center text-sm relative z-10" style={{ background: 'var(--vq-surface)', color: 'var(--vq-muted)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div style={{ width: 24, height: 24, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
            <Image src="/logo.png" width={24} height={24} alt="" />
          </div>
          <span className="font-black" style={{ color: 'var(--vq-text)' }}>VibeQuest</span>
        </div>
        <p>© {new Date().getFullYear()} VibeQuest. Teaching kids the 10 skills that matter in the AI era.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/pricing" className="hover:text-[var(--vq-text)] transition-colors">Pricing</Link>
          <Link href="/gallery" className="hover:text-[var(--vq-text)] transition-colors">Gallery</Link>
          <Link href="/sign-up" className="hover:text-[var(--vq-text)] transition-colors">Sign Up</Link>
          <Link href="/sign-in" className="hover:text-[var(--vq-text)] transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
