import type React from 'react';
import type { Sign } from '../types';

const RED = '#d42a3b', BLUE = '#1e5fa8';

/** Placeholder sign illustration drawn in SVG. Replace with official MoRTH artwork when licensed. */
export default function SignGraphic({ sign, size = 96 }: { sign: Sign; size?: number }) {
  const g = sign.glyph;
  const isEmoji = /\p{Extended_Pictographic}/u.test(g);
  const fs = g.length > 3 ? 20 : g.length > 1 ? 34 : isEmoji ? 38 : 48;
  const dark = sign.style === 'compulsory' || sign.style === 'info';
  const textFill = sign.style === 'stop' || dark ? '#fff' : '#14232b';
  let shape: React.ReactElement;
  switch (sign.shape) {
    case 'octagon': shape = <polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" fill={RED} stroke="#fff" strokeWidth="4" />; break;
    case 'triangle': shape = <polygon points="50,6 96,88 4,88" fill="#fff" stroke={RED} strokeWidth="8" strokeLinejoin="round" />; break;
    case 'inv-triangle': shape = <polygon points="4,12 96,12 50,94" fill="#fff" stroke={RED} strokeWidth="8" strokeLinejoin="round" />; break;
    case 'rect': shape = <rect x="6" y="10" width="88" height="80" rx="10" fill={BLUE} stroke="#fff" strokeWidth="3" />; break;
    default: shape = sign.style === 'compulsory'
      ? <circle cx="50" cy="50" r="45" fill={BLUE} stroke="#fff" strokeWidth="3" />
      : <circle cx="50" cy="50" r="42" fill={sign.overlay === 'bar' ? RED : '#fff'} stroke={RED} strokeWidth="9" />;
  }
  const ty = sign.shape === 'triangle' ? 72 : sign.shape === 'inv-triangle' ? 40 : 50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={sign.name}>
      {shape}
      {g && <text x="50" y={ty} textAnchor="middle" dominantBaseline="central" fontSize={fs} fontWeight="900" fill={textFill} fontFamily="Nunito, system-ui, sans-serif">{g}</text>}
      {sign.overlay === 'cross' && <line x1="20" y1="80" x2="80" y2="20" stroke={RED} strokeWidth="8" strokeLinecap="round" />}
      {sign.overlay === 'bar' && <rect x="20" y="43" width="60" height="14" rx="3" fill="#fff" />}
    </svg>
  );
}
