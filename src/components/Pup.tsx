import { useEffect, useState } from 'react';
import type { MascotState } from '../lib/mascot';

/**
 * "Pup" - original student-dog mascot (tan face, brown floppy ears, learner "L" badge, teal backpack straps).
 * Pure SVG + CSS transforms: no animation runs in IDLE except an occasional blink (a timer, not a loop).
 */
export default function Pup({ state = 'IDLE', size = 48, blink = false, className = '' }: {
  state?: MascotState; size?: number; blink?: boolean; className?: string;
}) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (!blink || state !== 'IDLE') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let t1 = 0, t2 = 0;
    const loop = () => {
      t1 = window.setTimeout(() => {
        if (!document.hidden) { setBlinking(true); t2 = window.setTimeout(() => setBlinking(false), 140); }
        loop();
      }, 4000 + Math.random() * 4000);
    };
    loop();
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); setBlinking(false); };
  }, [blink, state]);

  const happyEyes = state === 'HAPPY' || state === 'ENCOURAGING';
  const wide = state === 'EXCITED' || state === 'STREAK_CELEBRATION';
  const sad = state === 'DISAPPOINTED';
  const confused = state === 'CONFUSED';
  const closed = blinking;
  const ink = '#2b1d14';

  const eye = (cx: number) => {
    if (happyEyes || closed) return <path d={`M${cx - 5} 52q5 -6 10 0`} stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />;
    const r = wide ? 5.4 : 4.4;
    return (
      <g>
        <circle cx={cx} cy={sad ? 52 : 51} r={r} fill={ink} />
        <circle cx={cx + 1.6} cy={(sad ? 52 : 51) - 1.8} r={1.6} fill="#fff" />
        {wide && <circle cx={cx - 1.8} cy={52.5} r={0.9} fill="#fff" />}
      </g>
    );
  };

  return (
    <svg className={`pup ${className}`} data-state={state} width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="113" rx="34" ry="5" fill="#000" opacity=".1" />
      <g className="pup-all">
        {/* tail */}
        <g className="pup-tail"><path d="M92 100q16 -4 14 -20" stroke="#b9824a" strokeWidth="7" fill="none" strokeLinecap="round" /></g>
        {/* body + backpack straps + learner badge */}
        <path d="M24 116q0 -30 36 -30t36 30z" fill="#e3b072" />
        <path d="M40 88l-4 28M80 88l4 28" stroke="#0f9d94" strokeWidth="7" strokeLinecap="round" />
        <rect x="52" y="97" width="16" height="16" rx="2.5" fill="#fff" stroke="#c8d3d6" strokeWidth="1" />
        <path d="M58 100.5v8.5h6" stroke="#e0364a" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* thumbs-up paw */}
        <g className="pup-paw">
          <rect x="84" y="82" width="17" height="14" rx="6" fill="#e3b072" stroke="#b9824a" strokeWidth="1.2" />
          <rect x="86" y="73" width="7.5" height="11" rx="3.5" fill="#e3b072" stroke="#b9824a" strokeWidth="1.2" />
        </g>
        {/* head */}
        <g className="pup-head">
          <g className="pup-ear-l"><path d="M33 36q-17 4 -14 32q2 10 12 6q5 -16 5 -34z" fill="#8a5a33" /></g>
          <g className="pup-ear-r"><path d="M87 36q17 4 14 32q-2 10 -12 6q-5 -16 -5 -34z" fill="#8a5a33" /></g>
          <ellipse cx="60" cy="54" rx="30" ry="28" fill="#e9b97a" />
          <path d="M60 28q-6 10 0 20q6 -10 0 -20z" fill="#fff" opacity=".85" />
          <ellipse cx="60" cy="68" rx="15" ry="11" fill="#fff6e6" />
          {/* brows */}
          {sad && <><path d="M42 45l12 -3M78 45l-12 -3" stroke={ink} strokeWidth="2.4" strokeLinecap="round" /></>}
          {confused && <><path d="M42 43h12" stroke={ink} strokeWidth="2.4" strokeLinecap="round" /><path d="M66 38q6 -3 12 1" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" /></>}
          {(state === 'IDLE' || happyEyes || wide) && <path d="M43 43q6 -3 11 0M66 43q6 -3 11 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".55" />}
          {eye(49)}{eye(71)}
          {/* nose + mouth */}
          <ellipse cx="60" cy="62" rx="5" ry="3.6" fill={ink} />
          {state === 'IDLE' && <path d="M52 71q8 6 16 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
          {(state === 'HAPPY' || state === 'ENCOURAGING') && <path d="M51 70q9 9 18 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
          {wide && <><path d="M51 69q9 12 18 0z" fill="#7a2b2b" /><path d="M56 75q4 4 8 0" fill="#f08a8a" stroke="none" /></>}
          {sad && <path d="M53 74q7 -5 14 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
          {confused && <path d="M53 73q3 -3 6 0t6 0" stroke={ink} strokeWidth="2.4" fill="none" strokeLinecap="round" />}
        </g>
        {confused && <text className="pup-q" x="92" y="30" fontSize="20" fontWeight="800" fill="#0f9d94" fontFamily="system-ui, sans-serif">?</text>}
        {/* celebration sparkles (streak only) */}
        <g className="pup-spark" fill="#f5a000">
          <path d="M16 28l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
          <path d="M104 22l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" />
          <path d="M100 56l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4z" />
        </g>
      </g>
    </svg>
  );
}
