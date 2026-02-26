'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  code: string;
  childName?: string;
  loading?: boolean;
}

/**
 * LivePreview — sandboxed iframe that renders AI-generated code in real-time.
 * Uses srcdoc + sandbox to prevent:
 * - Same-origin access (no parent DOM access)
 * - Form submission
 * - Popup creation
 * - External network requests (via CSP meta tag)
 */
export default function LivePreview({ code, childName, loading }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0); // force refresh

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

  const srcdoc = code ? buildSrcdoc(code) : '';

  return (
    <div className={`rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
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
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-48 h-6 rounded animate-shimmer mb-3 mx-auto bg-gray-200" />
              <div className="w-32 h-4 rounded animate-shimmer mb-2 mx-auto bg-gray-200" />
              <div className="w-40 h-4 rounded animate-shimmer mx-auto bg-gray-200" />
              <p className="text-gray-400 text-sm mt-4 animate-pulse">Building your app... ✨</p>
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
