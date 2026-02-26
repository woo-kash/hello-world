/**
 * sound.js — Web Audio API sound effects (works in Electron + browser).
 */

export function playSuccessSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);

    // Ascending arpeggio: C5 E5 G5 C6 E6
    const arpNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    arpNotes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(master);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.11;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.4, t + 0.025);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.start(t);
      osc.stop(t + 0.55);
    });

    // Final shimmer chord (triangle waves, soft and sustained)
    const chordNotes = [523.25, 659.25, 783.99, 1046.50];
    const chordStart = ctx.currentTime + arpNotes.length * 0.11 + 0.05;
    chordNotes.forEach(freq => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.connect(env);
      env.connect(master);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, chordStart);
      env.gain.linearRampToValueAtTime(0.12, chordStart + 0.06);
      env.gain.exponentialRampToValueAtTime(0.001, chordStart + 1.1);
      osc.start(chordStart);
      osc.stop(chordStart + 1.1);
    });
  } catch (_) {
    // Not in a browser/Electron environment — silently ignore
  }
}
