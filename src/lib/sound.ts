// Tiny original WebAudio tones (no external audio assets). Mutable via settings.
let ctx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  if (!ctx) return;
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + start); o.stop(ctx.currentTime + start + dur + 0.05);
}
export function play(kind: 'right' | 'wrong' | 'win' | 'tap', enabled: boolean) {
  if (!enabled) return;
  try {
    ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    if (kind === 'right') { tone(660, 0, 0.12); tone(880, 0.1, 0.18); }
    else if (kind === 'wrong') { tone(220, 0, 0.18, 'triangle'); tone(180, 0.12, 0.22, 'triangle'); }
    else if (kind === 'win') { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.22)); }
    else tone(500, 0, 0.04, 'square', 0.03);
  } catch { /* audio unavailable */ }
}
