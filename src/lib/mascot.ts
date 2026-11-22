import { useCallback, useEffect, useRef, useState } from 'react';

export type MascotState = 'IDLE' | 'HAPPY' | 'EXCITED' | 'DISAPPOINTED' | 'CONFUSED' | 'ENCOURAGING' | 'STREAK_CELEBRATION';
export type MascotMode = 'on' | 'reduced' | 'off';

/** How long each reaction lasts (ms). Normal reactions 500-1200, streak celebration 1-2 s. */
export const DURATION: Record<MascotState, number> = {
  IDLE: 0, HAPPY: 700, EXCITED: 1000, DISAPPOINTED: 900, CONFUSED: 900, ENCOURAGING: 800, STREAK_CELEBRATION: 1800
};
/** After a sad/confused reaction the pup returns with a short supportive smile. */
const RECOVERY_SMILE_MS = 600;

export interface Memory { streak: number; prevWrong: boolean; wrongRun: number }
export const freshMemory = (): Memory => ({ streak: 0, prevWrong: false, wrongRun: 0 });

/**
 * Pure decision logic (no timers, easy to test).
 *  correct  1 -> HAPPY · 2,3,4 -> EXCITED · 5,10,15.. -> STREAK_CELEBRATION · 6-9 -> HAPPY (kept small)
 *  correct after a mistake -> ENCOURAGING
 *  wrong -> DISAPPOINTED (a second wrong in a row -> CONFUSED, never anything harsher)
 *  mode 'reduced' only reacts to: mistakes, recovery, streak of 3, and every 5th streak.
 */
export function decide(mem: Memory, correct: boolean, mode: MascotMode): { state: MascotState; mem: Memory } {
  if (!correct) {
    const wrongRun = mem.wrongRun + 1;
    return { state: mode === 'off' ? 'IDLE' : wrongRun >= 2 ? 'CONFUSED' : 'DISAPPOINTED', mem: { streak: 0, prevWrong: true, wrongRun } };
  }
  const streak = mem.streak + 1;
  const next: Memory = { streak, prevWrong: false, wrongRun: 0 };
  if (mode === 'off') return { state: 'IDLE', mem: next };
  if (streak >= 5 && streak % 5 === 0) return { state: 'STREAK_CELEBRATION', mem: next };
  if (mem.prevWrong) return { state: 'ENCOURAGING', mem: next };
  if (mode === 'reduced') return { state: streak === 3 ? 'EXCITED' : 'IDLE', mem: next };
  if (streak >= 2 && streak <= 4) return { state: 'EXCITED', mem: next };
  return { state: 'HAPPY', mem: next };
}

/**
 * Event-driven controller. The quiz calls onAnswer(correct); nothing here watches the UI.
 * Only one reaction runs at a time; a new answer replaces the current one, and the
 * state always returns to IDLE when the timer ends.
 */
export function useMascot(mode: MascotMode) {
  const [state, setState] = useState<MascotState>('IDLE');
  const mem = useRef<Memory>(freshMemory());
  const timers = useRef<number[]>([]);

  const clear = () => { timers.current.forEach(t => window.clearTimeout(t)); timers.current = []; };
  useEffect(() => clear, []);
  useEffect(() => { if (mode === 'off') { clear(); setState('IDLE'); } }, [mode]);

  const onAnswer = useCallback((correct: boolean) => {
    const r = decide(mem.current, correct, mode);
    mem.current = r.mem;
    clear();
    if (r.state === 'IDLE') { setState('IDLE'); return; }
    setState(r.state);
    const sad = r.state === 'DISAPPOINTED' || r.state === 'CONFUSED';
    timers.current.push(window.setTimeout(() => {
      if (sad) {
        setState('ENCOURAGING');
        timers.current.push(window.setTimeout(() => setState('IDLE'), RECOVERY_SMILE_MS));
      } else setState('IDLE');
    }, DURATION[r.state]));
  }, [mode]);

  const reset = useCallback(() => { clear(); mem.current = freshMemory(); setState('IDLE'); }, []);
  return { state, onAnswer, reset };
}
