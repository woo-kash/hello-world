'use client';

import { useEffect, useState, useMemo } from 'react';

interface Props {
  totalStars: number;
  success: boolean;
  loading: boolean;
}

// ─── Background star field ──────────────────────────────────────────
function StarField() {
  const stars = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 2,
      delay: Math.random() * 5,
      dur: 2 + Math.random() * 4,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Shooting star ──────────────────────────────────────────────────
function ShootingStar({ delay }: { delay: number }) {
  return (
    <div
      className="absolute animate-shooting-star pointer-events-none"
      style={{
        left: `${10 + Math.random() * 30}%`,
        top: `${5 + Math.random() * 20}%`,
        animationDelay: `${delay}s`,
        animationDuration: '1.5s',
      }}
    >
      <div className="w-1 h-1 bg-white rounded-full" style={{
        boxShadow: '-8px 0 6px rgba(255,255,255,0.6), -16px 0 10px rgba(255,255,255,0.3)',
      }} />
    </div>
  );
}

// ─── SVG Star with glow ─────────────────────────────────────────────
function Star({ lit, index, total }: { lit: boolean; index: number; total: number }) {
  const cx = 24;
  const cy = 24;
  // Generate star points
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? 20 : 9;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(' ');

  return (
    <div
      className={`transition-all duration-500 ${lit ? 'animate-scale-in' : ''}`}
      style={{
        transform: lit ? 'scale(1.15)' : 'scale(0.9)',
        opacity: lit ? 1 : 0.2,
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <svg width={56} height={56} viewBox="0 0 48 48" className={lit ? 'animate-pulse-glow' : ''}>
        <defs>
          <radialGradient id={`starGlow-${index}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity={lit ? 0.6 : 0} />
            <stop offset="100%" stopColor="transparent" stopOpacity={0} />
          </radialGradient>
          <linearGradient id={`starFill-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={lit ? '#fde047' : '#6b7280'} />
            <stop offset="100%" stopColor={lit ? '#f59e0b' : '#4b5563'} />
          </linearGradient>
        </defs>
        {/* Outer glow */}
        {lit && <circle cx={cx} cy={cy} r={22} fill={`url(#starGlow-${index})`} />}
        {/* Star shape */}
        <polygon
          points={points}
          fill={`url(#starFill-${index})`}
          stroke={lit ? '#fbbf24' : '#6b728080'}
          strokeWidth={1}
        />
        {/* Inner highlight */}
        {lit && (
          <polygon
            points={Array.from({ length: 10 }, (_, i) => {
              const angle = (i * Math.PI) / 5 - Math.PI / 2;
              const r = i % 2 === 0 ? 12 : 5;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="#fef3c7"
            opacity={0.4}
          />
        )}
      </svg>
    </div>
  );
}

// ─── Ring counter ───────────────────────────────────────────────────
function RingCounter({ count, total }: { count: number; total: number }) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (count / total) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={72} height={72} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={36} cy={36} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        {/* Progress arc */}
        <circle
          cx={36} cy={36} r={radius}
          fill="none"
          stroke={count === total ? '#22c55e' : '#fbbf24'}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-yellow-400 font-bold text-xl">{count}</span>
        <span className="text-white/40 text-[10px]">/ {total}</span>
      </div>
    </div>
  );
}

// ─── Constellation lines ────────────────────────────────────────────
function ConstellationLines({ count, total }: { count: number; total: number }) {
  if (count < total) return null;

  // Calculate star positions (evenly spaced)
  const positions = Array.from({ length: total }, (_, i) => {
    const spacing = 100 / (total + 1);
    return { x: spacing * (i + 1), y: 50 };
  });

  return (
    <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {positions.map((pos, i) => {
        if (i === 0) return null;
        const prev = positions[i - 1];
        return (
          <line
            key={i}
            x1={prev.x} y1={prev.y}
            x2={pos.x} y2={pos.y}
            stroke="#fbbf2460"
            strokeWidth={0.5}
            className="animate-draw-line"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        );
      })}
    </svg>
  );
}

// ─── Particle trail ─────────────────────────────────────────────────
function ParticleTrail({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = Array.from({ length: 6 }, (_, i) => ({
    x: 20 + Math.random() * 60,
    y: 30 + Math.random() * 40,
    delay: Math.random() * 0.5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-400 animate-float-up"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main StarsGame ─────────────────────────────────────────────────
export default function StarsGame({ totalStars, success, loading }: Props) {
  const [litCount, setLitCount] = useState(0);
  const [showTrail, setShowTrail] = useState(false);

  useEffect(() => {
    if (loading) {
      setLitCount(0);
      setShowTrail(false);
      return;
    }

    if (!success) {
      setLitCount(0);
      setShowTrail(false);
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLitCount(i);
      setShowTrail(true);
      setTimeout(() => setShowTrail(false), 400);
      if (i >= totalStars) clearInterval(interval);
    }, 400);

    return () => clearInterval(interval);
  }, [success, loading, totalStars]);

  const allLit = litCount >= totalStars;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10"
      style={{ background: 'linear-gradient(180deg, #0c0a2a 0%, #1a1145 50%, #0d1b3e 100%)' }}
    >
      {/* Star field background */}
      <StarField />

      {/* Constellation lines when all lit */}
      <ConstellationLines count={litCount} total={totalStars} />

      {/* Particle trails */}
      <ParticleTrail active={showTrail} />

      {/* Header */}
      <div className="relative px-5 py-3 border-b border-white/10 flex items-center gap-3">
        <span className="text-lg">🌙</span>
        <h3 className="text-white font-bold text-sm flex-1">Night Sky</h3>
        {allLit && <span className="text-green-400 text-xs animate-pulse">✨ Complete!</span>}
      </div>

      {/* Shooting stars during loading */}
      {loading && (
        <>
          <ShootingStar delay={0} />
          <ShootingStar delay={0.7} />
          <ShootingStar delay={1.4} />
        </>
      )}

      {/* Stars */}
      <div className="relative py-10 px-6">
        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: totalStars }).map((_, i) => (
            <Star key={i} lit={litCount > i} index={i} total={totalStars} />
          ))}
        </div>
      </div>

      {/* Ring counter */}
      <div className="relative flex justify-center pb-6">
        <RingCounter count={litCount} total={totalStars} />
      </div>

      {loading && (
        <p className="relative text-center text-purple-300 text-sm pb-4 animate-pulse">
          Counting stars... ✨
        </p>
      )}
    </div>
  );
}
