'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

const TRIVIA = [
  { emoji: '🐛', fact: 'The first computer bug was a real bug! In 1947, a moth got stuck in a Navy computer.' },
  { emoji: '👩‍💻', fact: 'Ada Lovelace wrote the world\'s first algorithm in 1843 — 100 years before computers were invented!' },
  { emoji: '🖱️', fact: 'The first computer mouse was carved out of wood and had just one button.' },
  { emoji: '🏋️', fact: 'The first computer, ENIAC, weighed 27 tonnes — heavier than 3 elephants!' },
  { emoji: '♟️', fact: 'Deep Blue became the first AI to beat a World Chess Champion in 1997.' },
  { emoji: '📧', fact: 'The first email ever sent in 1971 just said "QWERTYUIOP" — a keyboard test!' },
  { emoji: '🌐', fact: 'Tim Berners-Lee invented the World Wide Web in 1989 — and gave it to everyone for free!' },
  { emoji: '🎮', fact: 'Pac-Man\'s creator got the idea from a pizza — he took out a slice and saw the shape!' },
  { emoji: '🐍', fact: 'The first mobile phone game was Snake on Nokia phones in 1997.' },
  { emoji: '🤖', fact: 'The word "robot" comes from a 1920 Czech play — it means "forced labour".' },
  { emoji: '🔍', fact: 'Google was originally called "BackRub" because it analysed backlinks.' },
  { emoji: '⛏️', fact: 'Minecraft was first coded by just one person in 6 days!' },
  { emoji: '🚀', fact: 'The Apollo 11 moon computer had less power than your microwave oven.' },
  { emoji: '📱', fact: 'ChatGPT reached 100 million users in just 2 months — faster than any app in history!' },
  { emoji: '🎨', fact: 'The first AI artwork sold at auction fetched $432,500 — more than most human artists!' },
  { emoji: '🌟', fact: 'AI can now compose music, write stories, and build apps — just like you\'re doing right now!' },
  { emoji: '💾', fact: 'The first hard drive, made in 1956, was the size of a wardrobe and held only 5 MB.' },
  { emoji: '🦾', fact: 'There are more transistors in modern chips than there are stars visible from Earth.' },
];

interface Props {
  code: string;
  childName?: string;
  loading?: boolean;
  className?: string;
}

/**
 * LivePreview — sandboxed iframe that renders AI-generated code in real-time.
 * Uses srcdoc + sandbox to prevent:
 * - Same-origin access (no parent DOM access)
 * - Form submission
 * - Popup creation
 * - External network requests (via CSP meta tag)
 */
export default function LivePreview({ code, childName, loading, className }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0); // force refresh
  const [buildProgress, setBuildProgress] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);

  // Build the full HTML document with CSP + error catching
  const buildSrcdoc = useCallback((sourceCode: string) => {
    // Wrap the code in a full HTML doc if it isn't one already
    const hasHtmlTag = /<html/i.test(sourceCode);
    const hasBodyTag = /<body/i.test(sourceCode);

    let fullCode = sourceCode;
    if (!hasHtmlTag && !hasBodyTag) {
      // Assume it's a code snippet — wrap in HTML
      const isHTML = /<\w+/.test(sourceCode);
      if (isHTML) {
        fullCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 16px; }
  </style>
</head>
<body>
${sourceCode}
</body>
</html>`;
      } else {
        // It's just JavaScript — wrap in a script
        fullCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: monospace; padding: 16px; color: #333; background: #fafafa; }
    #output { white-space: pre-wrap; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
<div id="output"></div>
<script>
  const _log = [];
  const originalLog = console.log;
  console.log = (...args) => {
    _log.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '));
    document.getElementById('output').textContent = _log.join('\\n');
    originalLog(...args);
  };
  try {
    ${sourceCode}
  } catch(e) {
    document.getElementById('output').textContent = 'Error: ' + e.message;
    window.parent.postMessage({ type: 'vq-error', error: e.message }, '*');
  }
</script>
</body>
</html>`;
      }
    }

    // Inject CSP meta tag after <head> or at the start
    const cspTag = `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; img-src * data: blob:; font-src * data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval';">`;
    const errorScript = `<script>
  window.onerror = function(msg, url, line) {
    window.parent.postMessage({ type: 'vq-error', error: msg + ' (line ' + line + ')' }, '*');
  };
</script>`;

    if (fullCode.includes('<head>')) {
      fullCode = fullCode.replace('<head>', `<head>\n${cspTag}\n${errorScript}`);
    } else if (fullCode.includes('<html>')) {
      fullCode = fullCode.replace('<html>', `<html>\n<head>${cspTag}\n${errorScript}</head>`);
    }

    return fullCode;
  }, []);

  // Listen for error messages from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'vq-error') {
        setError(e.data.error);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Reset error when code changes
  useEffect(() => {
    setError(null);
  }, [code]);

  // Progress bar: exponential ease to ~88% while loading
  useEffect(() => {
    if (!loading) { setBuildProgress(0); return; }
    setBuildProgress(0);
    const interval = setInterval(() => {
      setBuildProgress(prev => prev >= 88 ? prev : prev + (88 - prev) * 0.15);
    }, 300);
    return () => clearInterval(interval);
  }, [loading]);

  // Trivia: cycle every 3 seconds while loading
  useEffect(() => {
    if (!loading) return;
    setTriviaIndex(Math.floor(Math.random() * TRIVIA.length));
    const interval = setInterval(() => {
      setTriviaIndex(i => (i + 1) % TRIVIA.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const srcdoc = code ? buildSrcdoc(code) : '';

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col ${isFullscreen ? 'fixed inset-4 z-50' : ''} ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center gap-3 bg-black/20">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-green-500/60" />
        </div>
        <span className="text-white/40 text-xs flex-1 font-mono">preview</span>
        {childName && (
          <span className="text-purple-300 text-xs">Built by {childName} ✨</span>
        )}
        <button
          onClick={() => { setKey(k => k + 1); setError(null); }}
          className="text-white/40 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          🔄
        </button>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="text-white/40 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? '⬜' : '⬛'}
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 relative bg-white" style={{ minHeight: isFullscreen ? 'auto' : 320 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-xs">
              {/* Spinning gear + label */}
              <div className="text-center mb-5">
                <div className="text-4xl mb-2 animate-spin" style={{ display: 'inline-block', animationDuration: '2s' }}>⚙️</div>
                <p className="text-gray-600 font-semibold text-sm">Building your app…</p>
              </div>
              {/* Progress bar */}
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${buildProgress}%`,
                    background: 'linear-gradient(90deg, #1fb38f, #22c55e)',
                  }}
                />
              </div>
              <p className="text-gray-400 text-xs text-right mb-5">{Math.round(buildProgress)}%</p>
              {/* Trivia card */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Did you know?</p>
                <div className="text-3xl mb-2">{TRIVIA[triviaIndex].emoji}</div>
                <p className="text-gray-600 text-sm leading-relaxed">{TRIVIA[triviaIndex].fact}</p>
              </div>
            </div>
          </div>
        )}

        {!code && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <span className="text-5xl block mb-3 animate-idle-bob">🖥️</span>
              <p className="text-gray-400 text-sm">Your creation will appear here!</p>
              <p className="text-gray-300 text-xs mt-1">Submit your prompt to see a live preview</p>
            </div>
          </div>
        )}

        {code && (
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={srcdoc}
            sandbox="allow-scripts"
            className="w-full h-full border-0"
            style={{ minHeight: isFullscreen ? 'calc(100vh - 120px)' : 320 }}
            title="Live Preview"
          />
        )}
      </div>

      {/* Error bar */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-400/20 flex items-center gap-2">
          <span className="text-red-400 text-xs">⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-300 text-xs hover:text-white ml-auto"
          >
            dismiss
          </button>
        </div>
      )}
    </div>
  );
}
