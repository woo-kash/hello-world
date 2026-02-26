'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  onChange: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

// Use loose typing for Web Speech API (not fully typed in all TS versions)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecognition = any;

function getSpeechRecognition(): (new () => AnyRecognition) | null {
  if (typeof window === 'undefined') return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export default function VoiceInput({ value, onChange, onSubmit, placeholder, rows = 3, disabled, className }: Props) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [supported, setSupported] = useState(false);
  const [micError, setMicError] = useState(false);
  const recognitionRef = useRef<AnyRecognition>(null);
  const gotResultRef = useRef(false);
  // Keep a ref to the latest value so onend closure doesn't go stale
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  function startListening() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    setMicError(false);
    gotResultRef.current = false;

    const recognition = new SR();
    recognition.continuous = true;   // keep recording until stopListening() called
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: AnyRecognition) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        gotResultRef.current = true;
        const current = valueRef.current;
        onChange(current ? current + ' ' + finalTranscript : finalTranscript);
        setInterim('');
      } else {
        setInterim(interimTranscript);
      }
    };

    recognition.onend = () => {
      setListening(false);
      setInterim('');
      if (onSubmit && gotResultRef.current) {
        onSubmit();
      }
      gotResultRef.current = false;
    };

    recognition.onerror = (e: AnyRecognition) => {
      setListening(false);
      setInterim('');
      if (e.error === 'not-allowed') setMicError(true);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
    setInterim('');
  }

  const displayValue = listening ? value + (interim ? ' ' + interim : '') : value;

  return (
    <div className="relative">
      <div className="flex gap-2 items-start">
        <textarea
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          placeholder={listening ? '🎤 Listening...' : placeholder}
          rows={rows}
          disabled={disabled}
          className={`flex-1 bg-white/10 text-[var(--vq-text)] placeholder-[var(--vq-muted)] rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--vq-primary)] text-sm leading-relaxed border border-[var(--vq-border)] ${listening ? 'ring-2 ring-red-400/70' : ''} ${disabled ? 'opacity-50' : ''} ${className ?? ''}`}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && onSubmit) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        {supported && (
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            disabled={disabled}
            title={listening ? 'Stop listening' : 'Speak your answer'}
            className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
              listening
                ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/40'
                : 'bg-[var(--vq-border)] hover:bg-[var(--vq-primary)] hover:text-white'
            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span className="text-lg">{listening ? '⏹' : '🎤'}</span>
          </button>
        )}
      </div>
      {listening && (
        <p className="text-red-500 text-xs mt-1 animate-pulse">🎤 Listening — speak now…</p>
      )}
      {micError && (
        <p className="text-red-500 text-xs mt-1">🎤 Mic permission denied — please allow microphone access</p>
      )}
    </div>
  );
}
