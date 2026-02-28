'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AnimationFrame, RobotState } from '@/lib/gameEngine';

interface Props {
  grid: number[][];
  cols: number;
  rows: number;
  goal: [number, number];
  robotStart: { x: number; y: number };
  robotDir: 'right' | 'down' | 'left' | 'up';
  frames: AnimationFrame[];
  theme?: 'space' | 'forest' | 'pirate';
  character?: string;
}

const CELL_SIZE = 64;
const DIR_ANGLES = { right: 0, down: 90, left: 180, up: 270 };

// ─── Theme configs ──────────────────────────────────────────────────
const THEMES = {
  space: {
    bg: 'linear-gradient(135deg, #0c0a2a 0%, #1a1145 40%, #0d1b3e 100%)',
    floorLight: 'rgba(99,102,241,0.08)',
    floorDark: 'rgba(99,102,241,0.04)',
    goalEmoji: '🚀',
    wallColor: '#6366f1',
  },
  forest: {
    bg: 'linear-gradient(135deg, #0a2e1a 0%, #1a4d2e 40%, #0d3b1e 100%)',
    floorLight: 'rgba(34,197,94,0.08)',
    floorDark: 'rgba(34,197,94,0.04)',
    goalEmoji: '🏠',
    wallColor: '#22c55e',
  },
  pirate: {
    bg: 'linear-gradient(135deg, #2d1b0e 0%, #4a2c17 40%, #3b2112 100%)',
    floorLight: 'rgba(234,179,8,0.08)',
    floorDark: 'rgba(234,179,8,0.04)',
    goalEmoji: '💰',
    wallColor: '#eab308',
  },
};

// ─── Background stars for space theme ───────────────────────────────
function SpaceBackground({ width, height }: { width: number; height: number }) {
  const stars = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    })),
    [width, height]
  );

  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={0.3}>
          <animate attributeName="opacity" values="0.15;0.8;0.15" dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {/* Nebula glow */}
      <defs>
        <radialGradient id="nebula" cx="70%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.15} />
          <stop offset="100%" stopColor="transparent" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill="url(#nebula)" />
    </svg>
  );
}

// ─── SVG Wall tiles ──────────────────────────────────────────────────
function WallTile({ theme }: { theme: 'space' | 'forest' | 'pirate' }) {
  if (theme === 'space') {
    return (
      <svg width={CELL_SIZE} height={CELL_SIZE} viewBox="0 0 64 64">
        <rect width={64} height={64} fill="#1e1b4b" rx={4} />
        <circle cx={16} cy={20} r={8} fill="#4338ca" opacity={0.7} />
        <circle cx={44} cy={14} r={5} fill="#6366f1" opacity={0.5} />
        <circle cx={32} cy={42} r={10} fill="#3730a3" opacity={0.6} />
        <circle cx={50} cy={48} r={6} fill="#4f46e5" opacity={0.4} />
        <circle cx={16} cy={20} r={3} fill="#312e81" opacity={0.5} />
        <circle cx={32} cy={42} r={4} fill="#1e1b4b" opacity={0.5} />
      </svg>
    );
  }
  if (theme === 'forest') {
    return (
      <svg width={CELL_SIZE} height={CELL_SIZE} viewBox="0 0 64 64">
        <rect width={64} height={64} fill="#14532d" rx={4} />
        <rect x={26} y={36} width={12} height={20} fill="#78350f" rx={2} />
        <polygon points="32,8 12,36 52,36" fill="#15803d" />
        <polygon points="32,18 16,40 48,40" fill="#166534" />
        <circle cx={12} cy={52} r={8} fill="#166534" opacity={0.7} />
        <circle cx={52} cy={50} r={6} fill="#15803d" opacity={0.6} />
      </svg>
    );
  }
  // pirate
  return (
    <svg width={CELL_SIZE} height={CELL_SIZE} viewBox="0 0 64 64">
      <rect width={64} height={64} fill="#44403c" rx={4} />
      <ellipse cx={32} cy={44} rx={16} ry={12} fill="#78350f" />
      <ellipse cx={32} cy={36} rx={16} ry={12} fill="#92400e" />
      <rect x={16} y={36} width={32} height={8} fill="#78350f" />
      <rect x={16} y={34} width={32} height={3} fill="#a16207" rx={1} />
      <rect x={16} y={44} width={32} height={3} fill="#a16207" rx={1} />
      <circle cx={32} cy={24} r={6} fill="#fef3c7" opacity={0.3} />
    </svg>
  );
}

// ─── Goal tile ───────────────────────────────────────────────────────
function GoalTile({ theme }: { theme: 'space' | 'forest' | 'pirate' }) {
  const cfg = THEMES[theme];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-pulse-glow">
        <span className="text-3xl">{cfg.goalEmoji}</span>
      </div>
      <div className="absolute inset-2 rounded-lg border-2 animate-pulse" style={{ borderColor: `${cfg.wallColor}40` }} />
    </div>
  );
}

// ─── Dust particle ──────────────────────────────────────────────────
function DustParticle({ x, y, id }: { x: number; y: number; id: number }) {
  const offsets = [
    { dx: -8, dy: 4 }, { dx: 8, dy: 2 }, { dx: 0, dy: 6 }, { dx: -4, dy: -2 },
  ];
  const o = offsets[id % 4];
  return (
    <div
      className="animate-dust-puff absolute rounded-full pointer-events-none"
      style={{
        left: x + o.dx,
        top: y + o.dy,
        width: 6,
        height: 6,
        backgroundColor: 'rgba(209,213,219,0.5)',
      }}
    />
  );
}

// ─── Firework particles ─────────────────────────────────────────────
function Fireworks({ x, y }: { x: number; y: number }) {
  const colors = ['#fbbf24', '#f472b6', '#34d399', '#60a5fa', '#c084fc', '#fb923c', '#f87171', '#2dd4bf'];
  const offsets = [
    { x: 40, y: -40 }, { x: -40, y: -40 }, { x: 40, y: 40 }, { x: -40, y: 40 },
    { x: 0, y: -55 }, { x: 55, y: 0 }, { x: 0, y: 55 }, { x: -55, y: 0 },
  ];

  return (
    <>
      {offsets.map((off, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-firework-burst pointer-events-none"
          style={{
            left: x + CELL_SIZE / 2,
            top: y + CELL_SIZE / 2,
            width: 8,
            height: 8,
            backgroundColor: colors[i],
            '--fw-x': `${off.x}px`,
            '--fw-y': `${off.y}px`,
            animationDelay: `${i * 0.05}s`,
          } as React.CSSProperties}
        />
      ))}
      <div
        className="absolute animate-poof pointer-events-none"
        style={{
          left: x + CELL_SIZE / 2 - 20,
          top: y + CELL_SIZE / 2 - 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)',
        }}
      />
    </>
  );
}

// ─── Robot component ────────────────────────────────────────────────
// Three-layer structure keeps CSS animation and rotation on separate divs
// so keyframe `transform` values never override the rotation.
function Robot({ robot, isMoving, atGoal, character }: { robot: RobotState; isMoving: boolean; atGoal: boolean; character?: string }) {
  const rotate = DIR_ANGLES[robot.dir];
  return (
    // Outer: position only — transitions left/top smoothly
    <div
      className="absolute"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        left: robot.col * CELL_SIZE,
        top: robot.row * CELL_SIZE,
        transition: 'left 0.3s ease, top 0.3s ease',
        zIndex: 10,
      }}
    >
      {/* Middle: rotation only — never receives animation keyframes */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ transform: `rotate(${rotate}deg)`, transition: 'transform 0.25s ease' }}
      >
        {/* Inner: animation (translateY/scale only) */}
        <div className={`flex items-center justify-center ${isMoving ? 'animate-robot-walk' : atGoal ? '' : 'animate-idle-bob'}`}>
          {character ? (
            <span
              style={{
                fontSize: 36,
                filter: atGoal ? 'drop-shadow(0 0 10px gold)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                display: 'block',
                lineHeight: 1,
              }}
            >
              {character}
            </span>
          ) : (
            <svg width={48} height={48} viewBox="0 0 48 48">
              <ellipse cx={24} cy={44} rx={14} ry={3} fill="rgba(99,102,241,0.3)" />
              <rect x={8} y={14} width={32} height={26} rx={8} fill="#6366f1" />
              <rect x={10} y={16} width={28} height={22} rx={6} fill="#818cf8" opacity={0.3} />
              <rect x={12} y={4} width={24} height={16} rx={6} fill="#818cf8" />
              <line x1={24} y1={4} x2={24} y2={0} stroke="#c7d2fe" strokeWidth={2} />
              <circle cx={24} cy={0} r={3} fill="#fbbf24">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={17} cy={12} r={4} fill="#1e1b4b" />
              <circle cx={31} cy={12} r={4} fill="#1e1b4b" />
              <circle cx={18} cy={11} r={1.5} fill="white" />
              <circle cx={32} cy={11} r={1.5} fill="white" />
              {atGoal && <path d="M17 17 Q24 23 31 17" fill="none" stroke="#fbbf24" strokeWidth={2} strokeLinecap="round" />}
              <polygon points="24,40 18,48 30,48" fill="#fbbf24" opacity={0.8} />
              <rect x={4} y={18} width={6} height={14} rx={3} fill="#6366f1" />
              <rect x={38} y={18} width={6} height={14} rx={3} fill="#6366f1" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main GridGame ──────────────────────────────────────────────────
export default function GridGame({ grid, cols, rows, goal, robotStart, robotDir, frames, theme = 'space', character }: Props) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [message, setMessage] = useState(character ? `Ready! ${character}` : 'Ready! 🤖');
  const [isMoving, setIsMoving] = useState(false);
  const [dustParticles, setDustParticles] = useState<{ x: number; y: number; id: number; key: number }[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);

  const currentRobot = frames.length > 0
    ? frames[frameIdx].robot
    : { col: robotStart.x, row: robotStart.y, dir: robotDir };

  const atGoal = frames.length > 0 && frames[frameIdx]?.atGoal;

  const addDust = useCallback((col: number, row: number) => {
    const key = Date.now() + Math.random();
    const x = col * CELL_SIZE + CELL_SIZE / 2;
    const y = row * CELL_SIZE + CELL_SIZE;
    setDustParticles(prev => [...prev, { x, y, id: 0, key }, { x, y, id: 1, key: key + 1 }]);
    setTimeout(() => {
      setDustParticles(prev => prev.filter(p => p.key !== key && p.key !== key + 1));
    }, 500);
  }, []);

  useEffect(() => {
    if (frames.length === 0) {
      setFrameIdx(0);
      setMessage(character ? `Ready! ${character}` : 'Ready! 🤖');
      setShowFireworks(false);
      return;
    }

    setFrameIdx(0);
    setMessage(frames[0].message);
    setShowFireworks(false);

    const interval = setInterval(() => {
      setFrameIdx(prev => {
        const next = prev + 1;
        if (next >= frames.length) {
          clearInterval(interval);
          setMessage(frames[frames.length - 1].message);
          if (frames[frames.length - 1].atGoal) {
            setShowFireworks(true);
          }
          return prev;
        }
        setMessage(frames[next].message);
        setIsMoving(true);
        setTimeout(() => setIsMoving(false), 300);
        const prevRobot = frames[prev].robot;
        addDust(prevRobot.col, prevRobot.row);
        return next;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [frames, addDust]);

  const width = cols * CELL_SIZE;
  const height = rows * CELL_SIZE;
  const cfg = THEMES[theme];
  const progress = frames.length > 0 ? Math.min((frameIdx + 1) / frames.length, 1) : 0;

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: cfg.bg }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center gap-3 border-b border-white/10">
        <span className="text-lg">{theme === 'space' ? '🌌' : theme === 'forest' ? '🌲' : '🏴‍☠️'}</span>
        <h3 className="text-white font-bold text-sm flex-1">
          {theme === 'space' ? 'Space Station' : theme === 'forest' ? 'Enchanted Forest' : 'Pirate Cove'}
        </h3>
        {frames.length > 0 && (
          <span className="text-xs text-white/50">
            {Math.min(frameIdx + 1, frames.length)}/{frames.length}
          </span>
        )}
      </div>

      {/* Message bar */}
      <div className="mx-4 mt-3 bg-black/30 rounded-xl px-4 py-2 text-center text-white text-sm min-h-[36px] backdrop-blur-sm border border-white/5">
        {message}
      </div>

      {/* Grid */}
      <div className="p-4 overflow-auto">
        <div className="relative mx-auto rounded-xl overflow-hidden" style={{ width, height }}>
          {theme === 'space' && <SpaceBackground width={width} height={height} />}

          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const isGoal = goal[0] === colIdx && goal[1] === rowIdx;
              const isCheckerLight = (rowIdx + colIdx) % 2 === 0;
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    left: colIdx * CELL_SIZE,
                    top: rowIdx * CELL_SIZE,
                    backgroundColor: cell === 1 ? 'transparent' : isCheckerLight ? cfg.floorLight : cfg.floorDark,
                    borderRight: colIdx < cols - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    borderBottom: rowIdx < rows - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  {cell === 1 && <WallTile theme={theme} />}
                  {isGoal && <GoalTile theme={theme} />}
                </div>
              );
            })
          )}

          {dustParticles.map(p => (
            <DustParticle key={p.key} x={p.x} y={p.y} id={p.id} />
          ))}

          <Robot robot={currentRobot} isMoving={isMoving} atGoal={atGoal} character={character} />

          {showFireworks && (
            <Fireworks x={currentRobot.col * CELL_SIZE} y={currentRobot.row * CELL_SIZE} />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {frames.length > 0 && (
        <div className="mx-4 mb-4">
          <div className="h-2 bg-black/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress * 100}%`,
                background: atGoal
                  ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                  : `linear-gradient(90deg, ${cfg.wallColor}, ${cfg.wallColor}cc)`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
