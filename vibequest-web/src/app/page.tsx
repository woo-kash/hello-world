import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

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
  },
  {
    fear: '"My kid just consumes AI, not creates with it"',
    answer: 'Every mission ends with something they MADE — a game, an app, a tool. The AI is a tool in their hands, not a replacement for their thinking.',
    emoji: '🔨',
  },
  {
    fear: '"I can\'t evaluate tech education"',
    answer: 'The skill dashboard shows exactly what they\'re learning, in plain English. No jargon. No guessing.',
    emoji: '📊',
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
    builds: ['A robot maze game', 'A star lighting machine', 'Their own platformer'],
  },
  {
    emoji: '🗺️',
    name: 'Adventurers',
    age: 'Ages 9–12',
    color: 'from-blue-400 to-purple-500',
    builds: ['A working calculator', 'A quiz game', 'A custom space shooter'],
  },
  {
    emoji: '💻',
    name: 'Vibe Coders',
    age: 'Ages 13–16',
    color: 'from-green-400 to-cyan-500',
    builds: ['A full landing page', 'An AI chatbot', 'A complete game studio'],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <span className="text-white font-bold text-xl">VibeQuest</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-purple-300 hover:text-white text-sm transition-colors">Pricing</Link>
          <SignedOut>
            <Link href="/sign-in" className="text-purple-300 hover:text-white text-sm transition-colors">Sign In</Link>
            <Link href="/sign-up" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm rounded-xl transition-colors">
              Start Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-sm rounded-xl transition-colors">
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-4 py-2 text-yellow-300 text-sm mb-8">
          <span>✨</span>
          <span>Powered by Claude AI · Used by millions of professionals</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Every child will use AI at work.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
            Will yours direct it — or be directed by it?
          </span>
        </h1>

        <p className="text-xl text-purple-200 max-w-2xl mx-auto mb-4">
          VibeQuest teaches the 10 skills that actually matter in the AI era: how to think clearly, communicate precisely, and build with AI. Starting from age 6.
        </p>
        <p className="text-purple-400 mb-10">No coding experience required — from either of you.</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            href="/sign-up"
            className="px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xl rounded-2xl transition-colors inline-flex items-center gap-2"
          >
            Start Free — 3 Missions Included 🚀
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xl rounded-2xl transition-colors"
          >
            See Pricing →
          </Link>
        </div>
        <p className="text-purple-400 text-sm">No credit card required · Cancel anytime</p>
      </section>

      {/* The 10 Skills */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">The 10 skills that matter</h2>
        <p className="text-purple-300 text-center mb-12">Not syntax. Not memorisation. The skills that make someone great at working with AI.</p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {SKILLS_GRID.map(s => (
            <div key={s.name} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:border-purple-400/30 transition-colors">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-white font-semibold text-sm mb-1">{s.name}</div>
              <div className="text-purple-400 text-xs">{s.desc}</div>
              <div className="mt-2 text-xs text-purple-600">{s.category}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What kids build */}
      <section className="bg-white/5 border-y border-white/10 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-3">What kids actually build</h2>
          <p className="text-purple-300 text-center mb-12">Every mission ends with something real. Not a worksheet — something they made.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(tier => (
              <div key={tier.name} className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} text-white mb-4`}>
                  <span>{tier.emoji}</span>
                  <span>{tier.name} · {tier.age}</span>
                </div>
                <ul className="space-y-2">
                  {tier.builds.map(b => (
                    <li key={b} className="text-purple-200 text-sm flex items-center gap-2">
                      <span className="text-green-400">✓</span> {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why parents choose VibeQuest */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-3">Why parents choose VibeQuest</h2>
        <p className="text-purple-300 text-center mb-12">We know what keeps parents up at night. Here&apos;s how we address it.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PARENT_ANXIETIES.map(a => (
            <div key={a.emoji} className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="text-4xl mb-4">{a.emoji}</div>
              <p className="text-white font-semibold mb-3 italic">{a.fear}</p>
              <p className="text-purple-200 text-sm leading-relaxed">{a.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-white/5 border-y border-white/10 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-xl">⭐</span>)}
          </div>
          <p className="text-white text-2xl font-semibold mb-4">
            &ldquo;My 8-year-old built her first robot game in 20 minutes. She has not stopped talking about coding since.&rdquo;
          </p>
          <p className="text-purple-400">— Parent of an Explorer-tier student</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Parent FAQ</h2>
        <div className="space-y-6">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-2">{q}</h3>
              <p className="text-purple-200 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-6">🚀</div>
        <h2 className="text-4xl font-bold text-white mb-4">Your child&apos;s AI superpower starts here</h2>
        <p className="text-purple-200 mb-8">
          3 free missions. No credit card. Your child could complete their first mission in 5 minutes.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-xl rounded-2xl transition-colors"
        >
          Start Free Today →
        </Link>
        <p className="text-purple-400 text-sm mt-4">Then from $9.99/month · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-purple-400 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xl">🚀</span>
          <span className="text-white font-bold">VibeQuest</span>
        </div>
        <p>© {new Date().getFullYear()} VibeQuest. Teaching kids the 10 skills that matter in the AI era.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
          <Link href="/sign-up" className="hover:text-white transition-colors">Sign Up</Link>
          <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
