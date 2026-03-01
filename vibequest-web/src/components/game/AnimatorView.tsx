'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import LivePreview from '@/components/game/LivePreview';
import VoiceInput from '@/components/ui/VoiceInput';
import VictoryScreen from '@/components/game/VictoryScreen';
import type { Mission } from '@/lib/missions';
import type { Tier } from '@/lib/claude';

// ─── Shape stamps ──────────────────────────────────────────────────────────

interface StampDef {
  id: string;
  label: string;
  emoji: string;
  svgPath: string; // SVG element string (relative to 0 0 40 40)
}

const STAMPS: StampDef[] = [
  {
    id: 'sun', label: 'Sun', emoji: '☀️',
    svgPath: '<circle cx="20" cy="20" r="9" fill="#FFD700"/><g stroke="#FFD700" stroke-width="2" stroke-linecap="round"><line x1="20" y1="4" x2="20" y2="8"/><line x1="20" y1="32" x2="20" y2="36"/><line x1="4" y1="20" x2="8" y2="20"/><line x1="32" y1="20" x2="36" y2="20"/><line x1="8.7" y1="8.7" x2="11.5" y2="11.5"/><line x1="28.5" y1="28.5" x2="31.3" y2="31.3"/><line x1="31.3" y1="8.7" x2="28.5" y2="11.5"/><line x1="11.5" y1="28.5" x2="8.7" y2="31.3"/></g>',
  },
  {
    id: 'cloud', label: 'Cloud', emoji: '☁️',
    svgPath: '<ellipse cx="20" cy="24" rx="16" ry="10" fill="white"/><circle cx="14" cy="20" r="8" fill="white"/><circle cx="23" cy="17" r="10" fill="white"/>',
  },
  {
    id: 'tree', label: 'Tree', emoji: '🌲',
    svgPath: '<polygon points="20,2 4,28 36,28" fill="#22c55e"/><polygon points="20,12 6,34 34,34" fill="#16a34a"/><rect x="16" y="32" width="8" height="8" fill="#92400e"/>',
  },
  {
    id: 'fish', label: 'Fish', emoji: '🐟',
    svgPath: '<ellipse cx="18" cy="20" rx="13" ry="8" fill="#38bdf8"/><polygon points="36,12 36,28 28,20" fill="#0284c7"/><circle cx="10" cy="17" r="2" fill="#0f172a"/><path d="M 8 22 Q 14 26 20 22" fill="none" stroke="#0284c7" stroke-width="1.5" stroke-linecap="round"/>',
  },
  {
    id: 'house', label: 'House', emoji: '🏠',
    svgPath: '<polygon points="20,4 36,18 4,18" fill="#ef4444"/><rect x="8" y="18" width="24" height="18" fill="#fca5a5"/><rect x="15" y="26" width="10" height="10" fill="#92400e"/>',
  },
  {
    id: 'star', label: 'Star', emoji: '⭐',
    svgPath: '<polygon points="20,3 25,14 37,14 27,21 31,33 20,26 9,33 13,21 3,14 15,14" fill="#facc15"/>',
  },
  {
    id: 'rainbow', label: 'Rainbow', emoji: '🌈',
    svgPath: '<path d="M4,30 A16,16 0 0,1 36,30" fill="none" stroke="#ef4444" stroke-width="3"/><path d="M7,30 A13,13 0 0,1 33,30" fill="none" stroke="#f97316" stroke-width="3"/><path d="M10,30 A10,10 0 0,1 30,30" fill="none" stroke="#facc15" stroke-width="3"/><path d="M13,30 A7,7 0 0,1 27,30" fill="none" stroke="#22c55e" stroke-width="3"/><path d="M16,30 A4,4 0 0,1 24,30" fill="none" stroke="#3b82f6" stroke-width="3"/>',
  },
  {
    id: 'rocket', label: 'Rocket', emoji: '🚀',
    svgPath: '<path d="M20,2 Q28,8 28,20 L20,30 L12,20 Q12,8 20,2" fill="#818cf8"/><ellipse cx="20" cy="20" rx="5" ry="5" fill="#c7d2fe"/><polygon points="12,20 6,30 14,26" fill="#ef4444"/><polygon points="28,20 34,30 26,26" fill="#ef4444"/><ellipse cx="20" cy="30" rx="4" ry="3" fill="#fbbf24" opacity="0.8"/>',
  },
  {
    id: 'moon', label: 'Moon', emoji: '🌙',
    svgPath: '<path d="M28,6 A14,14 0 1,0 28,34 A10,10 0 1,1 28,6" fill="#fde68a"/>',
  },
  {
    id: 'flower', label: 'Flower', emoji: '🌸',
    svgPath: '<circle cx="20" cy="20" r="5" fill="#fbbf24"/><ellipse cx="20" cy="10" rx="4" ry="6" fill="#f9a8d4"/><ellipse cx="20" cy="30" rx="4" ry="6" fill="#f9a8d4"/><ellipse cx="10" cy="20" rx="6" ry="4" fill="#f9a8d4"/><ellipse cx="30" cy="20" rx="6" ry="4" fill="#f9a8d4"/><ellipse cx="12.9" cy="12.9" rx="4" ry="6" transform="rotate(45 12.9 12.9)" fill="#fda4af"/><ellipse cx="27.1" cy="27.1" rx="4" ry="6" transform="rotate(45 27.1 27.1)" fill="#fda4af"/><ellipse cx="27.1" cy="12.9" rx="4" ry="6" transform="rotate(-45 27.1 12.9)" fill="#fda4af"/><ellipse cx="12.9" cy="27.1" rx="4" ry="6" transform="rotate(-45 12.9 27.1)" fill="#fda4af"/>',
  },
  {
    id: 'mountain', label: 'Mountain', emoji: '🏔️',
    svgPath: '<polygon points="20,3 36,36 4,36" fill="#64748b"/><polygon points="20,3 26,14 14,14" fill="white"/><polygon points="8,36 20,16 32,36" fill="#475569"/>',
  },
  {
    id: 'bird', label: 'Bird', emoji: '🐦',
    svgPath: '<ellipse cx="20" cy="22" rx="10" ry="7" fill="#38bdf8"/><circle cx="26" cy="16" r="5" fill="#38bdf8"/><circle cx="28" cy="15" r="1.5" fill="#0f172a"/><polygon points="32,16 38,14 34,19" fill="#fbbf24"/><path d="M10,18 Q5,12 2,14 Q6,16 10,22" fill="#0284c7"/>',
  },
];

// ─── Placed shape type ──────────────────────────────────────────────────────

interface PlacedShape {
  id: string;
  stampId: string;
  x: number;
  y: number;
  size: number;
  color: string; // tint filter or override
}

// ─── Canvas dimensions ──────────────────────────────────────────────────────

const CANVAS_W = 420;
const CANVAS_H = 280;

// ─── AnimatorView ──────────────────────────────────────────────────────────

interface Props {
  mission: Mission;
  childId: string;
  childName?: string;
  tier: Tier;
}

export default function AnimatorView({ mission, childId, tier }: Props) {
  const [activeTab, setActiveTab] = useState<'shapes' | 'draw'>('shapes');
  const [placedShapes, setPlacedShapes] = useState<PlacedShape[]>([]);
  const [selectedStamp, setSelectedStamp] = useState<StampDef | null>(STAMPS[0]);
  const [stampSize, setStampSize] = useState(60);
  const [stampColor, setStampColor] = useState('#FFD700');
  const [animDescription, setAnimDescription] = useState('');
  const [animatedHtml, setAnimatedHtml] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showVictory, setShowVictory] = useState(false);

  // Draw tab state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(4);
  const [brushColor, setBrushColor] = useState('#FFD700');
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  // ── Drawing helpers ──────────────────────────────────────────────────────

  function getCanvasPos(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  function startDraw(e: React.MouseEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getCanvasPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPos(e);
    ctx.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = tool === 'eraser' ? '#f0fbf7' : brushColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function stopDraw() { setIsDrawing(false); }

  function clearCanvas() {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ── Shape placement on SVG canvas ────────────────────────────────────────

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!selectedStamp) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    const newShape: PlacedShape = {
      id: `shape-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      stampId: selectedStamp.id,
      x,
      y,
      size: stampSize,
      color: stampColor,
    };
    setPlacedShapes(prev => [...prev, newShape]);
  }

  function removeLastShape() {
    setPlacedShapes(prev => prev.slice(0, -1));
  }

  // ── Build SVG string from placed shapes ──────────────────────────────────

  function buildSvg(): string {
    const shapes = placedShapes.map(s => {
      const stamp = STAMPS.find(st => st.id === s.stampId);
      if (!stamp) return '';
      const half = s.size / 2;
      return `<g id="${s.id}" transform="translate(${s.x - half}, ${s.y - half}) scale(${s.size / 40})">${stamp.svgPath}</g>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" style="background:transparent">
${shapes}
</svg>`;
  }

  // ── Animate It! ──────────────────────────────────────────────────────────

  async function handleAnimate() {
    if (!animDescription.trim() || loading) return;
    if (placedShapes.length === 0 && !canvasRef.current) return;

    setLoading(true);
    setError('');

    const svgContent = buildSvg();
    const canvasDataUrl = canvasRef.current?.toDataURL() ?? '';

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'animate',
          missionId: mission.id,
          svgContent,
          canvasDataUrl,
          kidDescription: animDescription,
          tier,
        }),
      });

      if (!res.ok) throw new Error('AI request failed');

      const data: { html: string; explanation: string } = await res.json();
      setAnimatedHtml(data.html ?? '');
      setExplanation(data.explanation ?? '');
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      // Save progress
      if (childId) {
        await fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ childId, missionId: mission.id, completed: true, attempts: newAttempts }),
        });
      }

      if (newAttempts === 1) {
        setTimeout(() => setShowVictory(true), 3000);
      }
    } catch {
      setError('Oops! Something went wrong. Try again!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--vq-bg)' }}>
      {/* Header */}
      <header className="border-b px-6 py-3 flex items-center gap-4" style={{ borderColor: 'var(--vq-border)', background: 'var(--vq-surface)' }}>
        <Link href="/dashboard" className="transition-colors hover:text-[var(--vq-text)]" style={{ color: 'var(--vq-primary)' }}>
          ← Back
        </Link>
        <div className="flex-1">
          <span className="font-bold" style={{ color: 'var(--vq-text)' }}>{mission.title}</span>
          <span className="ml-3 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(31,179,143,0.12)', color: 'var(--vq-primary)' }}>
            animator
          </span>
        </div>
        {attempts > 0 && (
          <span className="text-sm" style={{ color: 'var(--vq-muted)' }}>{attempts} animation{attempts !== 1 ? 's' : ''}</span>
        )}
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Drawing tools */}
        <div className="space-y-4">
          {/* Story card */}
          <div className="rounded-2xl p-5" style={{ background: 'var(--vq-card)', border: '1px solid var(--vq-border)' }}>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--vq-muted)' }}>{mission.story}</p>
            <div className="rounded-xl p-3" style={{ background: 'var(--vq-bg)', border: '1px solid var(--vq-border)' }}>
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--vq-accent-3)' }}>Your mission:</p>
              <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{mission.challenge}</p>
            </div>
          </div>

          {/* Canvas + tabs */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--vq-border)', background: 'var(--vq-card)' }}>
            {/* Tab bar */}
            <div className="flex border-b" style={{ borderColor: 'var(--vq-border)' }}>
              {(['shapes', 'draw'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                  style={{
                    color: activeTab === tab ? 'var(--vq-primary)' : 'var(--vq-muted)',
                    borderBottom: activeTab === tab ? '2px solid var(--vq-primary)' : '2px solid transparent',
                    background: 'transparent',
                  }}
                >
                  {tab === 'shapes' ? '🟦 Shapes' : '🖌️ Draw'}
                </button>
              ))}
            </div>

            {/* SVG canvas with placed shapes (always visible as base) */}
            <div className="relative" style={{ width: '100%', aspectRatio: `${CANVAS_W}/${CANVAS_H}`, background: 'linear-gradient(135deg, #e0f7ef 0%, #f0fbf7 100%)', overflow: 'hidden' }}>
              {/* SVG layer: shapes */}
              <svg
                viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: activeTab === 'shapes' ? 'crosshair' : 'default' }}
                onClick={activeTab === 'shapes' ? handleSvgClick : undefined}
              >
                {placedShapes.map(s => {
                  const stamp = STAMPS.find(st => st.id === s.stampId);
                  if (!stamp) return null;
                  const half = s.size / 2;
                  return (
                    <g
                      key={s.id}
                      id={s.id}
                      transform={`translate(${s.x - half}, ${s.y - half}) scale(${s.size / 40})`}
                      dangerouslySetInnerHTML={{ __html: stamp.svgPath }}
                    />
                  );
                })}
              </svg>

              {/* Canvas layer: freehand drawing */}
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  cursor: activeTab === 'draw' ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default',
                  pointerEvents: activeTab === 'draw' ? 'auto' : 'none',
                }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
              />
            </div>

            {/* Tab-specific controls */}
            <div className="p-4 space-y-3">
              {activeTab === 'shapes' && (
                <>
                  <div className="grid grid-cols-6 gap-2">
                    {STAMPS.map(stamp => (
                      <button
                        key={stamp.id}
                        onClick={() => setSelectedStamp(stamp)}
                        title={stamp.label}
                        className="text-2xl p-1.5 rounded-xl transition-all"
                        style={{
                          background: selectedStamp?.id === stamp.id ? 'rgba(31,179,143,0.15)' : 'transparent',
                          border: selectedStamp?.id === stamp.id ? '1px solid var(--vq-primary)' : '1px solid transparent',
                        }}
                      >
                        {stamp.emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium" style={{ color: 'var(--vq-muted)' }}>Size</label>
                    <input
                      type="range" min="30" max="120" value={stampSize}
                      onChange={e => setStampSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      onClick={removeLastShape}
                      disabled={placedShapes.length === 0}
                      className="text-xs px-3 py-1.5 rounded-lg disabled:opacity-30 transition-colors"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      ↩ Undo
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'draw' && (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex gap-1">
                    {(['brush', 'eraser'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTool(t)}
                        className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
                        style={{
                          background: tool === t ? 'rgba(31,179,143,0.15)' : 'transparent',
                          border: `1px solid ${tool === t ? 'var(--vq-primary)' : 'var(--vq-border)'}`,
                          color: tool === t ? 'var(--vq-primary)' : 'var(--vq-muted)',
                        }}
                      >
                        {t === 'brush' ? '🖌️ Brush' : '🧹 Eraser'}
                      </button>
                    ))}
                  </div>
                  <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--vq-border)', cursor: 'pointer' }} />
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs" style={{ color: 'var(--vq-muted)' }}>S</span>
                    <input type="range" min="2" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="flex-1" />
                    <span className="text-xs" style={{ color: 'var(--vq-muted)' }}>L</span>
                  </div>
                  <button
                    onClick={clearCanvas}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description + Animate button */}
          <div className="space-y-3">
            <label className="font-semibold text-sm block" style={{ color: 'var(--vq-text)' }}>
              🎬 Describe your animation:
            </label>
            <VoiceInput
              value={animDescription}
              onChange={setAnimDescription}
              onSubmit={handleAnimate}
              placeholder={
                tier === 1
                  ? 'e.g. "Make the sun slowly rise, clouds drift across, and the tree sways in the breeze"'
                  : tier === 2
                  ? 'e.g. "Sun rises with rays rotating, clouds move at different speeds, stars twinkle and fade in"'
                  : 'e.g. "Physics-based rain: droplets fall with gravity, bounce on landing. Sun emits particles. Parallax clouds."'
              }
              rows={3}
              disabled={loading}
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {placedShapes.length === 0 && <p className="text-xs" style={{ color: 'var(--vq-muted)' }}>💡 {mission.starterHint}</p>}

            <button
              onClick={handleAnimate}
              disabled={loading || !animDescription.trim() || placedShapes.length === 0}
              className="w-full py-4 text-white font-bold rounded-xl transition-colors text-lg disabled:opacity-40"
              style={{ background: 'var(--vq-primary)' }}
            >
              {loading ? (
                <span className="animate-pulse">✨ Animating your scene…</span>
              ) : (
                '✨ Animate It!'
              )}
            </button>
          </div>

          {/* AI explanation */}
          {explanation && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(31,179,143,0.06)', border: '1px solid rgba(31,179,143,0.25)' }}>
              <p className="text-sm" style={{ color: 'var(--vq-text)' }}>{explanation}</p>
              <p className="text-xs mt-2" style={{ color: 'var(--vq-muted)' }}>Describe something different to iterate!</p>
            </div>
          )}
        </div>

        {/* Right: Animated preview */}
        <div className="space-y-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--vq-border)', background: 'var(--vq-card)' }}>
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--vq-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--vq-text)' }}>🖥️ Animation Preview</span>
              {animatedHtml && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(31,179,143,0.12)', color: 'var(--vq-primary)' }}>
                  Live
                </span>
              )}
            </div>
            {animatedHtml ? (
              <LivePreview code={animatedHtml} loading={loading} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                <div className="text-6xl">🖼️</div>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--vq-text)' }}>Your animation will appear here</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--vq-muted)' }}>
                    {placedShapes.length === 0
                      ? 'Start by placing some shapes on the canvas!'
                      : 'Now describe how your scene should move.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Scene info */}
          {placedShapes.length > 0 && !animatedHtml && (
            <div className="rounded-2xl p-4" style={{ background: 'rgba(124,77,255,0.06)', border: '1px solid rgba(124,77,255,0.2)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--vq-purple)' }}>Your scene has {placedShapes.length} shape{placedShapes.length !== 1 ? 's' : ''}:</p>
              <p className="text-xs" style={{ color: 'var(--vq-muted)' }}>
                {[...new Set(placedShapes.map(s => STAMPS.find(st => st.id === s.stampId)?.emoji ?? ''))].join(' ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {showVictory && (
        <VictoryScreen
          mission={mission}
          attempts={attempts}
          tier={tier}
          childId={childId}
          onNext={() => { window.location.href = '/dashboard'; }}
          onReplay={() => {
            setShowVictory(false);
            setAnimatedHtml('');
            setExplanation('');
            setAnimDescription('');
            setAttempts(0);
            setPlacedShapes([]);
            clearCanvas();
          }}
        />
      )}
    </div>
  );
}
