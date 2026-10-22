// Original WebAudio sound effects (no external audio files). Mutable via Profile > Sound effects.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function note(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.35, slideTo?: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime + start;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
}

const vibrate = (p: number | number[]) => { try { navigator.vibrate?.(p); } catch { /* not supported */ } };

export function play(kind: 'right' | 'wrong' | 'win' | 'tap', enabled: boolean) {
  if (!enabled) return;
  try {
    ensure();
    if (kind === 'right') {            // bright two-note "ding-ding" with sparkle
      note(784, 0, 0.18, 'triangle'); note(1175, 0.1, 0.32, 'triangle'); note(2349, 0.1, 0.2, 'sine', 0.08);
      vibrate(25);
    } else if (kind === 'wrong') {     // low descending "bonk"
      note(260, 0, 0.28, 'sawtooth', 0.22, 140); note(180, 0.14, 0.34, 'square', 0.14, 90);
      vibrate([60, 40, 90]);
    } else if (kind === 'win') {       // happy rising fanfare
      [523, 659, 784, 1047].forEach((f, i) => note(f, i * 0.11, 0.25, 'triangle', 0.32));
      note(1319, 0.5, 0.7, 'triangle', 0.32); note(1047, 0.5, 0.7, 'sine', 0.2); note(784, 0.5, 0.7, 'sine', 0.16);
      vibrate([40, 30, 40, 30, 80]);
    } else {                            // soft click
      note(620, 0, 0.06, 'square', 0.12); note(930, 0.02, 0.05, 'sine', 0.1);
      vibrate(8);
    }
  } catch { /* audio unavailable */ }
}
