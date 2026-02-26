'use client';

import { useEffect, useState } from 'react';
import { SceneFrame, Effect } from '@/lib/sceneEngine';
import { SceneConfig } from '@/lib/missions';

interface Props {
  sceneConfig: SceneConfig;
  frames: SceneFrame[];
  loading: boolean;
}

// ─── Effect renderers ───────────────────────────────────────────────
function SparkleEffect({ effect }: { effect: Effect }) {
  return (
    <div
      className="absolute pointer-events-none animate-sparkle"
      style={{
        left: `${effect.x}%`,
        top: `${effect.y}%`,
        animationDelay: `${effect.delay}s`,
      }}
    >
      <span className="text-2xl">✨</span>
    </div>
  );
}

function PoofEffect({ effect }: { effect: Effect }) {
  return (
    <div
      className="absolute pointer-events-none animate-poof"
      style={{
        left: `${effect.x}%`,
        top: `${effect.y}%`,
        animationDelay: `${effect.delay}s`,
      }}
    >
      <div className="w-10 h-10 rounded-full bg-yellow-400/30" />
    </div>
  );
}

function RainEffect({ effect }: { effect: Effect }) {
  const drops = Array.from({ length: 8 }, (_, i) => ({
    x: effect.x - 15 + Math.random() * 30,
    delay: effect.delay + i * 0.1,
  }));

  return (
    <>
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute pointer-events-none animate-float-up"
          style={{
            left: `${d.x}%`,
            top: `${effect.y}%`,
            animationDelay: `${d.delay}s`,
            animationDirection: 'reverse',
          }}
        >
          <span className="text-sm">💧</span>
        </div>
      ))}
    </>
  );
}

function SunEffect({ effect }: { effect: Effect }) {
  return (
    <div
      className="absolute pointer-events-none animate-pulse-glow"
      style={{
        left: `${effect.x - 5}%`,
        top: `${effect.y}%`,
      }}
    >
      <div className="w-16 h-16 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)' }}
      />
    </div>
  );
}

function CombineEffect({ effect }: { effect: Effect }) {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * 360,
    delay: effect.delay + i * 0.08,
  }));

  return (
    <>
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const dx = Math.cos(rad) * 5;
        const dy = Math.sin(rad) * 5;
        return (
          <div
            key={i}
            className="absolute pointer-events-none w-2 h-2 bg-yellow-300 rounded-full animate-poof"
            style={{
              left: `${effect.x + dx}%`,
              top: `${effect.y + dy}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        );
      })}
    </>
  );
}

function EffectRenderer({ effect }: { effect: Effect }) {
  switch (effect.type) {
    case 'sparkle': return <SparkleEffect effect={effect} />;
    case 'poof': return <PoofEffect effect={effect} />;
    case 'rain': return <RainEffect effect={effect} />;
    case 'sun': return <SunEffect effect={effect} />;
    case 'combine': return <CombineEffect effect={effect} />;
    default: return null;
  }
}

// ─── Main SceneGame ─────────────────────────────────────────────────
export default function SceneGame({ sceneConfig, frames, loading }: Props) {
  const [frameIdx, setFrameIdx] = useState(0);

  const currentFrame = frames.length > 0 ? frames[frameIdx] : null;

  useEffect(() => {
    if (frames.length === 0) {
      setFrameIdx(0);
      return;
    }

    setFrameIdx(0);

    const interval = setInterval(() => {
      setFrameIdx(prev => {
        const next = prev + 1;
        if (next >= frames.length) {
          clearInterval(interval);
          return prev;
        }
        return next;
      });
    }, 800); // Slower for scenes — easier for kids to follow

    return () => clearInterval(interval);
  }, [frames]);

  const progress = frames.length > 0 ? Math.min((frameIdx + 1) / frames.length, 1) : 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10"
      style={{ background: sceneConfig.background }}
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-3">
        <span className="text-lg">🎬</span>
        <h3 className="text-white font-bold text-sm flex-1">Scene View</h3>
        {frames.length > 0 && (
          <span className="text-xs text-white/50">
            {Math.min(frameIdx + 1, frames.length)}/{frames.length}
          </span>
        )}
      </div>

      {/* Message */}
      <div className="mx-4 mt-3 bg-black/30 rounded-xl px-4 py-2 text-center text-white text-sm min-h-[36px] backdrop-blur-sm border border-white/5">
        {currentFrame?.message ?? (loading ? 'Preparing scene... ✨' : 'Submit your solution to watch the scene! 🎬')}
      </div>

      {/* Scene viewport */}
      <div className="relative mx-4 my-4 rounded-xl overflow-hidden" style={{ height: 280 }}>
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.2) 100%)' }}
        />

        {/* Actors */}
        {currentFrame?.actors.map(actor => (
          actor.visible && (
            <div
              key={actor.id}
              className={`absolute transition-all duration-500 ${actor.animation}`}
              style={{
                left: `${actor.x}%`,
                top: `${actor.y}%`,
                transform: `translate(-50%, -50%) scale(${actor.scale})`,
              }}
            >
              <span className="text-4xl select-none">{actor.emoji}</span>
            </div>
          )
        ))}

        {/* Effects */}
        {currentFrame?.effects.map((effect, i) => (
          <EffectRenderer key={`${frameIdx}-${i}`} effect={effect} />
        ))}

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/50 text-sm animate-pulse">Loading scene...</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && frames.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl mb-3 block animate-idle-bob">🎬</span>
              <p className="text-white/40 text-sm">Your scene will play here!</p>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {frames.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: progress >= 1
                  ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                  : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
